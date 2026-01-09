import { ErrorSchema, ErrorStatus } from './errors.schemas.js';
import { status } from 'elysia';
import { objectEntries } from '../../lib/object-entries.js';

const errorCodes = new Set<string>();

export function createErrors<
	T extends Record<
		string,
		typeof ErrorSchema.infer & {
			status: ErrorStatus;
		}
	>,
>(value: T) {
	const errors = {} as {
		[K in keyof T]: () => ReturnType<
			typeof status<T[K]['status'], typeof ErrorSchema.infer>
		>;
	};
	for (const [key, { status: _status, ...error }] of objectEntries(value)) {
		if (errorCodes.has(error.code)) {
			throw new Error(`Duplicate error code: ${error.code}`);
		}
		errorCodes.add(error.code);
		(errors as Record<string, unknown>)[key] = () => status(_status, error);
	}
	return errors;
}
