import { createAuth } from './create-auth.js';
import type { OpenAPIV3 } from 'openapi-types';

const auth = createAuth();

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;

function getSchema() {
	return (_schema ??= auth.api.generateOpenAPISchema());
}

export async function getAuthOpenApi(): Promise<Partial<OpenAPIV3.Document>> {
	const { paths, components } = await getSchema();
	const reference: typeof paths = Object.create(null);

	for (const path of Object.keys(paths)) {
		const key = '/v1/auth' + path;
		reference[key] = paths[path];

		for (const method of Object.keys(paths[path])) {
			const operation = (reference[key] as any)[method];

			operation.tags = ['Better Auth'];
		}
	}
	return {
		components: components as any,
		paths: reference as any,
	};
}
