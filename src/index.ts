import Elysia from 'elysia';
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker';
import openapi from '@elysiajs/openapi';

export default new Elysia({
	adapter: CloudflareAdapter,
})
	.use(openapi())
	.get('/', (ctx) => ({ message: 'Hello World!' }))
	.compile();
