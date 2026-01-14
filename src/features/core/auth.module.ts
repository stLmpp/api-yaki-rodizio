import Elysia from 'elysia';
import { AuthRole, createAuth } from '../../lib/create-auth.js';
import { coreErrors } from './core-errors.js';

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

export const authModule = new Elysia({ name: 'auth' }).macro(
	'auth',
	(
		configOrRoles:
			| AuthRole[]
			| true
			| { allowAnonymous: boolean; roles?: AuthRole[] },
	) => ({
		resolve: async function authentication({ request: { headers } }) {
			const betterAuth = createAuth();
			const session = await betterAuth.api.getSession({
				headers,
			});

			if (!session) {
				return coreErrors.unauthorized();
			}

			if (Array.isArray(configOrRoles)) {
				if (!hasRequiredRole(configOrRoles, session.user.role)) {
					return coreErrors.roleNotAllowed([
						`Role ${configOrRoles} required. Provided: ${session.user.role}.`,
					]);
				}
			} else if (typeof configOrRoles === 'object') {
				if (!configOrRoles.allowAnonymous && session.user.isAnonymous) {
					return coreErrors.anonymousNotAllowed();
				}
				if (
					configOrRoles.roles?.length &&
					!hasRequiredRole(configOrRoles.roles, session.user.role)
				) {
					return coreErrors.roleNotAllowed([
						`Role ${configOrRoles.roles} required. Provided: ${session.user.role}.`,
					]);
				}
			}

			return {
				user: session.user,
				session: session.session,
				betterAuth,
			};
		},
	}),
);
