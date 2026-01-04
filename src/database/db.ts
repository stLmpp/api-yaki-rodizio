import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schemas.js';
import { relations } from './relations.js';
import { neon, neonConfig } from '@neondatabase/serverless';

// TODO
neonConfig.fetchEndpoint = 'http://localhost:5432/sql';
neonConfig.useSecureWebSocket = false;
neonConfig.poolQueryViaFetch = true;

export function createDb(connectionString: string) {
	const db = neon(connectionString);

	return {
		db: Object.assign(
			drizzle({
				schema,
				relations,
				client: db,
				casing: 'snake_case',
				logger: true,
			}),
			{
				schema,
			},
		),
		client: db,
	};
}
