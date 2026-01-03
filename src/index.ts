import Elysia from 'elysia';
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker';
import openapi from '@elysiajs/openapi';
import { authModule } from './features/core/auth.module.js';
import { roundModule } from './features/round/round.module.js';
import { z, ZodAny } from 'zod';

const plugins = [
	openapi({
		provider: 'swagger-ui',
		path: '/openapi',
		mapJsonSchema: {
			zod: (schema: ZodAny) =>
				z.toJSONSchema(schema, {
					unrepresentable: 'any',
				}),
		},
	}),
];
const features = [authModule(), roundModule()];

export default new Elysia({
	adapter: CloudflareAdapter,
})
	.use(plugins)
	.use(features)
	.compile();
