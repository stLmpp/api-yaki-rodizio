import { createErrors } from './create-errors.js';

export const coreErrors = createErrors({
	unauthorized: {
		code: 'CORE-0001',
		status: 401,
		message: 'Unauthorized',
	},
	roleNotAllowed: {
		code: 'CORE-0002',
		status: 403,
		message: 'Role not allowed',
	},
	anonymousNotAllowed: {
		code: 'CORE-0003',
		status: 403,
		message: 'Anonymous not allowed',
	},
});
