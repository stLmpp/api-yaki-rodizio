import Elysia from 'elysia';
import type { ElysiaConfig } from 'elysia/types';
import { authModule } from './auth.module.js';
import { createDb } from '../../database/db.js';
import { env } from 'cloudflare:workers';

export function createModule<const BasePath extends string = ''>(
	config?: ElysiaConfig<BasePath>,
) {
	return new Elysia(config)
		.use(authModule())
		.resolve(() => ({ db: createDb(env.DATABASE_URL) }));
}
