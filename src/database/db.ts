import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schemas.js';
import { relations } from './relations.js';
import { createNeonClient } from './create-neon-client.js';

export function createDb(connectionString: string) {
	const neonClient = createNeonClient(connectionString);

	return Object.assign(
		drizzleNeonHttp({
			schema,
			relations,
			client: neonClient,
			casing: 'snake_case',
			logger: true,
		}),
		{
			schema,
		},
	);
}

/**
 * Creates a drizzle Postgres client. Only used for seed
 * @param connectionString
 */
export function createDbPgClient(connectionString: string) {
	const client = new pg.Pool({
		connectionString,
	});

	return Object.assign(
		drizzlePostgres({
			schema,
			relations,
			client,
			casing: 'snake_case',
			logger: true,
		}),
		{
			schema,
			client,
		},
	);
}
