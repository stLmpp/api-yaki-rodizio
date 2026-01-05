import Elysia from 'elysia';
import { env } from 'cloudflare:workers';
import { AuthRole, createAuth as _createAuth } from '../../lib/create-auth.js';

function createAuth() {
	return _createAuth({
		connectionString: env.BETTER_AUTH_DATABASE_URL,
		redisToken: env.UPSTASH_REDIS_REST_TOKEN,
		redisUrl: env.UPSTASH_REDIS_REST_URL,
	});
}

function hasRequiredRole(
	requiredRoles: AuthRole[],
	userRoleString?: string | null,
): boolean {
	const sessionRoles = new Set(userRoleString?.split(',') ?? []);
	return requiredRoles.some((role) => sessionRoles.has(role));
}

export function authModule() {
	return new Elysia({ name: 'auth' })
		.mount(async (request) => {
			const betterAuth = createAuth();
			return betterAuth.handler(request);
		})
		.macro(
			'auth',
			(
				configOrRoles:
					| AuthRole[]
					| true
					| { allowAnonymous: boolean; roles?: AuthRole[] },
			) => ({
				async resolve({ status, request: { headers } }) {
					const betterAuth = createAuth();
					const session = await betterAuth.api.getSession({
						headers,
					});

					if (!session) {
						return status(401);
					}

					if (Array.isArray(configOrRoles)) {
						if (!hasRequiredRole(configOrRoles, session.user.role)) {
							return status(403);
						}
					} else if (typeof configOrRoles === 'object') {
						if (!configOrRoles.allowAnonymous && session.user.isAnonymous) {
							return status(403);
						}
						if (
							configOrRoles.roles?.length &&
							!hasRequiredRole(configOrRoles.roles, session.user.role)
						) {
							return status(403);
						}
					}

					return {
						user: session.user,
						session: session.session,
					};
				},
			}),
		);
}
