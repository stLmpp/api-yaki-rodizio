import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker';
import { orderModule } from './features/order/order.module.js';
import openapi from '@elysiajs/openapi';
import { authModule } from './features/core/auth.module.js';
import Elysia from 'elysia';

export default new Elysia({
	adapter: CloudflareAdapter,
})
	.use(openapi())
	.use(authModule)
	.use(orderModule)
	.compile();
