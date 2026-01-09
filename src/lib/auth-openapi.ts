import { createAuth } from './create-auth.js';
import { OpenAPIV3 } from 'openapi-types';

const auth = createAuth();

let _schema: OpenAPIV3.Document | null = null;

async function getSchema(): Promise<OpenAPIV3.Document> {
	return (_schema ??= (await auth.api.generateOpenAPISchema()) as never);
}

const hasBody = new Set(['post', 'put', 'patch']);

const httpMethods = new Set(Object.values(OpenAPIV3.HttpMethods));

function isHttpMethod(method: unknown): method is OpenAPIV3.HttpMethods {
	return httpMethods.has(method as OpenAPIV3.HttpMethods);
}

export async function getAuthOpenApi(): Promise<Partial<OpenAPIV3.Document>> {
	const { paths, components } = await getSchema();
	const reference: OpenAPIV3.PathsObject = {};

	for (const path of Object.keys(paths)) {
		const key = '/v1/auth' + path;
		reference[key] = paths[path];

		for (const method of Object.keys(paths[path] ?? {})) {
			if (!isHttpMethod(method)) {
				continue;
			}

			const operation = reference[key]?.[method];

			if (!operation) {
				continue;
			}

			operation.tags = ['Better Auth'];

			if (
				hasBody.has(method) &&
				(!operation.requestBody ||
					('content' in operation.requestBody &&
						!('application/json' in operation.requestBody.content)))
			) {
				operation.requestBody = {
					content: {
						'application/json': {
							schema: { type: 'object' },
						},
					},
				};
			}
		}
	}
	return {
		components: components,
		paths: reference,
	};
}
