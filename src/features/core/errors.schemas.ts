import { type } from 'arktype';

export const ErrorSchema = type({
	code: 'string',
	message: 'string',
	'details?': 'string[]',
});

const possibleErrorCodes = [
	400, 401, 403, 404, 422, 500, 502, 503, 504,
] as const;

export type ErrorStatus = (typeof possibleErrorCodes)[number];

export const errorsSchemas = Object.fromEntries(
	possibleErrorCodes.map((code) => [code, ErrorSchema]),
) as Record<ErrorStatus, typeof ErrorSchema>;
