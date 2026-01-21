import { createErrors } from '../core/create-errors.js';

export const orderErrors = createErrors({
	tableNotFound: {
		code: 'ORDER-0001',
		message: 'Table not found',
		status: 422,
	},
	orderNotFound: {
		code: 'ORDER-0002',
		message: 'Order not found',
		status: 404,
	},
});
