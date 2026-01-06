import Elysia from 'elysia';
import type { ElysiaConfig } from 'elysia/types';
import { authModule } from './auth.module.js';
import { createDb } from '../../database/db.js';
import { env } from 'cloudflare:workers';
import crypto from 'node:crypto';

export function createModule<const BasePath extends string = ''>(
	config?: ElysiaConfig<BasePath>,
) {
	return new Elysia(config)
		.use(authModule())
		.resolve(({ set, headers: _headers }) => {
			const headers = _headers as Record<string, string>;
			const correlationId =
				headers['x-correlation-id'] ??
				headers['cf-request-id'] ??
				crypto.randomUUID();
			set.headers['x-correlation-id'] = correlationId;
			return {
				correlationId,
			};
		})
		.resolve(() => ({ db: createDb(env.DATABASE_URL) }));
}
