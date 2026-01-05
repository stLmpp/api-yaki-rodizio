import { Redis } from '@upstash/redis/cloudflare';
import { betterAuth } from 'better-auth';
import { admin, anonymous, openAPI } from 'better-auth/plugins';
import { Kysely } from 'kysely';
import { env } from 'cloudflare:workers';
import { NeonDialect } from 'kysely-neon';
import { createNeonClient } from '../database/create-neon-client.js';

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
	const client = new Redis({
		token: options.redisToken,
		url: options.redisUrl,
	});
	return betterAuth({
		basePath: '/v1/auth',
		database: {
			db: new Kysely({
				dialect: new NeonDialect({
					neon: createNeonClient(options.connectionString),
				}),
				// TODO
				log: ['query', 'error'],
			}),
			type: 'postgres',
			casing: 'snake',
			transaction: true,
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
