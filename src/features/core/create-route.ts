import type { ElysiaConfig } from 'elysia/types';
import { authModule } from './auth.module.js';
import { createDb } from '../../database/db.js';
import { env } from 'cloudflare:workers';
import Elysia from 'elysia';

export function createRoute<const BasePath extends string = ''>(
	config?: ElysiaConfig<BasePath>,
) {
	return new Elysia(config)
		.use(authModule)
		.resolve(function databaseResolver() {
			return { db: createDb(env.DATABASE_URL) };
		});
}
