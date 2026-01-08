import { createErrors } from '../core/create-errors.js';

export const roundErrors = createErrors({
	roundNotFound: {
		code: 'ROUND-0001',
		message: 'Round not found.',
		status: 404,
	},
	roundAlreadyFinished: {
		code: 'ROUND-0002',
		message: 'Round already finished.',
		status: 422,
	},
	roundIsWaiting: {
		code: 'ROUND-0003',
		message: 'Round is waiting.',
		status: 422,
	},
	orderAlreadyFinished: {
		code: 'ROUND-0004',
		message: 'Order already finished.',
		status: 422,
	},
});
