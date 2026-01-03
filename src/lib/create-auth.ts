import { Redis } from '@upstash/redis/cloudflare';
import { betterAuth } from 'better-auth';
import { PostgresJSDialect } from 'kysely-postgres-js';
import postgres from 'postgres';
import { admin, anonymous, openAPI } from 'better-auth/plugins';
import { Kysely } from 'kysely';
import { env } from 'cloudflare:workers';

interface CreateAuthOptions {
	connectionString?: string;
	redisToken?: string;
	redisUrl?: string;
}

export function createAuth(options?: CreateAuthOptions) {
	options ??= {};
	options.connectionString ??= env.BETTER_AUTH_DATABASE_URL;
	options.redisToken ??= env.UPSTASH_REDIS_REST_TOKEN;
	options.redisUrl ??= env.UPSTASH_REDIS_REST_URL;
	// TODO error unable to parse response body
	const client = new Redis({
		token: options.redisToken,
		url: options.redisUrl,
		latencyLogging: true,
		responseEncoding: false,
		automaticDeserialization: true,
	});
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
				return client.get(key);
			},
			set: async (key, value, ttl) => {
				if (ttl) {
					await client.set(key, value, { ex: ttl });
				} else {
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
