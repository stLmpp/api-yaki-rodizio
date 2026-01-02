import Elysia from 'elysia';
import { auth, AuthRole } from '../../lib/auth.js';
import { coerceArray } from '../../lib/coerce-array.js';
import { env } from 'cloudflare:workers';

export const authModule = new Elysia({ name: 'auth' })
	.derive(() => ({ betterAuth: auth(env) }))
	.mount((request) => auth(env).handler(request))
	.macro('auth', (role: AuthRole | AuthRole[] | true) => ({
		async resolve({ status, request: { headers }, betterAuth }) {
			console.log('Authenticating...');
			// TODO non-null assertion
			const session = await betterAuth!.api.getSession({
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
