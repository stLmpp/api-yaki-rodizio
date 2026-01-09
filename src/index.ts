import './arktype.config.js';
import Elysia from 'elysia';
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker';
import openapi from '@elysiajs/openapi';
import { authModule, authRoutes } from './features/core/auth.module.js';
import { roundModule } from './features/round/round.module.js';
import serverTiming from '@elysiajs/server-timing';
import { getAuthOpenApi } from './lib/auth-openapi.js';
import { productModule } from './features/product/product.module.js';

declare global {
	interface BigInt {
		toJSON: () => string;
	}
}

BigInt.prototype.toJSON = function () {
	return String(this);
};

const documentation = await getAuthOpenApi();

const plugins = [
	serverTiming(),
	openapi({
		provider: 'swagger-ui',
		path: '/openapi',
		documentation,
		swagger: {
			deepLinking: true,
			displayRequestDuration: true,
		},
	}),
];
const features = [authRoutes, authModule(), roundModule(), productModule()];

export default new Elysia({
	adapter: CloudflareAdapter,
})
	.use(plugins)
	.use(features)
	.compile();
