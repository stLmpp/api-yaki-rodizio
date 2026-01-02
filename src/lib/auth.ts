import { betterAuth } from 'better-auth';
import { admin, anonymous, openAPI } from 'better-auth/plugins';
import { Kysely } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import postgres from 'postgres';

export const auth = (env: Env) =>
	betterAuth({
		basePath: '/v1/auth',
		database: {
			db: new Kysely({
				dialect: new PostgresJSDialect({
					postgres: postgres(env.DATABASE_URL),
				}),
				log: ['query', 'error'],
			}),
			type: 'postgres',
			casing: 'snake',
			transaction: true,
			debugLogs: true,
		},
		plugins: [anonymous(), admin(), openAPI()],
		experimental: {
			joins: true,
		},
	});

export enum AuthRole {
	Admin = 'admin',
	User = 'user',
}
