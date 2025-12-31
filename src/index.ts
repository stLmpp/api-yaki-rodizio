import Elysia from 'elysia';
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker';
import openapi from '@elysiajs/openapi';
import { auth } from './auth.js';

const betterAuth = new Elysia({ name: 'better-auth' })
	.mount(auth.handler)
	.macro('auth', {
		async resolve({ status, request: { headers } }) {
			const session = await auth.api.getSession({
				headers,
			});

			if (!session) {
				return status(401);
			}

			return {
				user: session.user,
				session: session.session,
			};
		},
	});

export default new Elysia({
	adapter: CloudflareAdapter,
})
	.use(openapi())
	.use(betterAuth)
	.get('/', (ctx) => ({ message: 'Hello World!' }), { auth: true })
	.compile();
