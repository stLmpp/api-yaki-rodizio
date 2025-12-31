import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from './database/schemas.js';
import { db } from './database/db.js';
import { admin, anonymous, openAPI } from 'better-auth/plugins';

export const auth = betterAuth({
	basePath: '/v1/auth',
	database: drizzleAdapter(db, {
		provider: 'pg',
		usePlural: false,
		camelCase: false,
		schema,
		transaction: true,
	}),
	plugins: [anonymous(), admin(), openAPI()],
	experimental: {
		joins: true,
	},
});
