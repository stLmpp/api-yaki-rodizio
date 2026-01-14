import type { ElysiaConfig } from 'elysia/types';
import crypto from 'node:crypto';
import Elysia from 'elysia';

export function createModule<const BasePath extends string = ''>(
	config?: ElysiaConfig<BasePath>,
) {
	return new Elysia(config).resolve(function correlationResolver({
		set,
		headers: _headers,
	}) {
		const headers = _headers as Record<string, string | undefined>;
		const correlationId =
			headers['x-correlation-id'] ??
			headers['cf-request-id'] ??
			crypto.randomUUID();
		set.headers['x-correlation-id'] = correlationId;
		return {
			correlationId,
		};
	});
}
