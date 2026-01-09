import { type } from 'arktype';

export const bigintParamType = type('string.integer', '=>', BigInt).configure({
	format: 'int64',
	examples: ['123', '456', '789'],
});
