import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schemas.js';
import { relations } from './relations.js';
import { createNeonClient } from './create-neon-client.js';

export function createDb(connectionString: string) {
	const neonClient = createNeonClient(connectionString);

	return Object.assign(
		drizzle({
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
