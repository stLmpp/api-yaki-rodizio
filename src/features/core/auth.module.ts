import Elysia from 'elysia';
import { coerceArray } from '../../lib/coerce-array.js';
import { env } from 'cloudflare:workers';
import { AuthRole, createAuth as _createAuth } from '../../lib/create-auth.js';

function createAuth() {
	return _createAuth({
		connectionString: env.BETTER_AUTH_DATABASE_URL,
		redisToken: env.UPSTASH_REDIS_REST_TOKEN,
		redisUrl: env.UPSTASH_REDIS_REST_URL,
	});
}

export function authModule() {
	return new Elysia({ name: 'auth' })
		.mount(async (request) => {
			const betterAuth = createAuth();
			return betterAuth.handler(request);
		})
		.macro('auth', (role: AuthRole | AuthRole[] | true) => ({
			async resolve({ status, request: { headers } }) {
				const betterAuth = createAuth();
				const session = await betterAuth.api.getSession({
					headers,
				});

				if (!session) {
					return status(401);
				}

				if (role !== true) {
					const roles = coerceArray(role);
					const sessionRoles = new Set(session.user.role?.split(',') ?? []);
					if (!roles.some((role) => sessionRoles.has(role))) {
						return status(403);
					}
				}

				return {
					user: session.user,
					session: session.session,
				};
			},
		}));
}
