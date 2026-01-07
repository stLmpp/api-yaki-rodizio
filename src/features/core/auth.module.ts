import Elysia from 'elysia';
import { AuthRole, createAuth } from '../../lib/create-auth.js';

function hasRequiredRole(
	requiredRoles: AuthRole[],
	userRoleString?: string | null,
): boolean {
	const sessionRoles = new Set(userRoleString?.split(',') ?? []);
	return requiredRoles.some((role) => sessionRoles.has(role));
}

export const authRoutes = new Elysia({ name: 'auth.routes' }).mount(
	async (request) => {
		const betterAuth = createAuth();
		return betterAuth.handler(request);
	},
);

export function authModule() {
	return new Elysia({ name: 'auth' }).macro(
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
