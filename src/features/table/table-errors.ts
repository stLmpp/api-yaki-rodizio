import { createErrors } from '../core/create-errors.js';

export const tableErrors = createErrors({
	tableNotFound: {
		code: 'TABLE-0001',
		message: 'Table not found',
		status: 404,
	},
});
