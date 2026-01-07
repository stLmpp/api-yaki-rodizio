import Elysia from 'elysia';
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker';
import openapi from '@elysiajs/openapi';
import { authModule, authRoutes } from './features/core/auth.module.js';
import { roundModule } from './features/round/round.module.js';
import { configure } from 'arktype';
import serverTiming from '@elysiajs/server-timing';
import { getAuthOpenApi } from './lib/auth-openapi.js';

(BigInt.prototype as any).toJSON = function () {
	return String(this);
};

configure({
	onUndeclaredKey: 'delete',
});

const documentation = await getAuthOpenApi();

const plugins = [
	serverTiming(),
	openapi({
		provider: 'swagger-ui',
		path: '/openapi',
		documentation,
	}),
];
const features = [authRoutes, authModule(), roundModule()];

export default new Elysia({
	adapter: CloudflareAdapter,
})
	.use(plugins)
	.use(features)
	.compile();
