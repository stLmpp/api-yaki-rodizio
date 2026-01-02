import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker';
import { orderModule } from './features/order/order.module.js';
import openapi from '@elysiajs/openapi';
import { authModule } from './features/core/auth.module.js';
import Elysia from 'elysia';

const plugins = [openapi()];
const features = [authModule(), orderModule()];

export default new Elysia({
	adapter: CloudflareAdapter,
})
	.use(plugins)
	.use(features)
	.compile();
