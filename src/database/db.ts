import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schemas.js';
import { relations } from './relations.js';
import pg from 'pg';

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle({
	schema,
	relations,
	client: pool,
});
