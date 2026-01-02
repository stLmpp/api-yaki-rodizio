import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schemas.js';
import { relations } from './relations.js';
import postgres from 'postgres';

export function createDb(connectionString: string) {
	const pool = postgres(connectionString);

	return {
		db: Object.assign(
			drizzle({
				schema,
				relations,
				client: pool,
				casing: 'snake_case',
				logger: true,
			}),
			{
				schema,
			},
		),
		client: pool,
	};
}
