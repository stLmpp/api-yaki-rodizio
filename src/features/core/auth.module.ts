import Elysia from 'elysia';
import { coerceArray } from '../../lib/coerce-array.js';
import { env } from 'cloudflare:workers';
import { AuthRole, createAuth as _createAuth } from '../../lib/create-auth.js';

function createAuth() {
	return _createAuth({
		redisPort: env.REDIS_PORT,
		redisPassword: env.REDIS_PASSWORD,
		connectionString: env.DATABASE_URL,
		redisHost: env.REDIS_HOST,
		redisUsername: env.REDIS_USERNAME,
	});
}

export function authModule() {
	return new Elysia({ name: 'auth' })
		.mount(async (request) => {
			const betterAuth = await createAuth();
			return betterAuth.handler(request);
		})
		.macro('auth', (role: AuthRole | AuthRole[] | true) => ({
			async resolve({ status, request: { headers } }) {
				const betterAuth = await createAuth();
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
