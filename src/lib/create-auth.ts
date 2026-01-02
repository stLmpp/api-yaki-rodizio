import { createClient } from 'redis';
import { betterAuth } from 'better-auth';
import { PostgresJSDialect } from 'kysely-postgres-js';
import postgres from 'postgres';
import { admin, anonymous, openAPI } from 'better-auth/plugins';
import { Kysely } from 'kysely';
import { env } from 'cloudflare:workers';

interface CreateAuthOptions {
	connectionString?: string;
	redisUsername?: string;
	redisPassword?: string;
	redisHost?: string;
	redisPort?: number | string;
}

export async function createAuth(options?: CreateAuthOptions) {
	options ??= {};
	options.connectionString ??= env.DATABASE_URL;
	options.redisUsername ??= env.REDIS_USERNAME;
	options.redisPassword ??= env.REDIS_PASSWORD;
	options.redisHost ??= env.REDIS_HOST;
	options.redisPort = Number(options.redisPort ?? env.REDIS_PORT);
	const client = createClient({
		username: options.redisUsername,
		password: options.redisPassword,
		socket: {
			host: options.redisHost,
			port: options.redisPort,
		},
	});
	await client.connect();
	return betterAuth({
		basePath: '/v1/auth',
		database: {
			db: new Kysely({
				dialect: new PostgresJSDialect({
					postgres: postgres(options.connectionString),
				}),
				log: ['query', 'error'],
			}),
			type: 'postgres',
			casing: 'snake',
			transaction: true,
			debugLogs: false,
		},
		plugins: [anonymous(), admin(), openAPI()],
		experimental: {
			joins: true,
		},
		secondaryStorage: {
			get: async (key) => {
				return await client.get(key);
			},
			set: async (key, value, ttl) => {
				if (ttl) {
					await client.set(key, value, { EX: ttl });
				}
				// or for ioredis:
				// if (ttl) await redis.set(key, value, 'EX', ttl)
				else {
					await client.set(key, value);
				}
			},
			delete: async (key) => {
				await client.del(key);
			},
		},
	});
}

export enum AuthRole {
	Admin = 'admin',
	User = 'user',
}
