import Elysia from 'elysia';
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker';
import openapi from '@elysiajs/openapi';
import { auth } from './auth.js';

export default new Elysia({
	adapter: CloudflareAdapter,
})
	.use(openapi())
	.mount(auth.handler)
	.get('/', (ctx) => ({ message: 'Hello World!' }))
	.compile();
