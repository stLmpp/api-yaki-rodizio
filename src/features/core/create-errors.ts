import { ErrorSchema, ErrorStatus } from './errors.schemas.js';
import { status } from 'elysia';

const errorCodes = new Set<string>();

export function createErrors<
	T extends {
		[key: string]: typeof ErrorSchema.infer & {
			status: ErrorStatus;
		};
	},
>(value: T) {
	const errors = {} as {
		[K in keyof T]: () => ReturnType<
			typeof status<T[K]['status'], typeof ErrorSchema.infer>
		>;
	};
	for (const [key, { status: _status, ...error }] of Object.entries(value)) {
		if (errorCodes.has(error.code)) {
			throw new Error(`Duplicate error code: ${error.code}`);
		}
		errorCodes.add(error.code);
		(errors as any)[key] = () => status(_status, error);
	}
	return errors;
}
