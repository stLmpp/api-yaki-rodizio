import Elysia from 'elysia';
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker';
import openapi from '@elysiajs/openapi';
import { authModule } from './features/core/auth.module.js';
import { roundModule } from './features/round/round.module.js';
import { configure } from 'arktype';

(BigInt.prototype as any).toJSON = function () {
	return String(this);
};

configure({
	onUndeclaredKey: 'delete',
});

const plugins = [
	openapi({
		provider: 'swagger-ui',
		path: '/openapi',
	}),
];
const features = [authModule(), roundModule()];

export default new Elysia({
	adapter: CloudflareAdapter,
})
	.use(plugins)
	.use(features)
	.compile();
