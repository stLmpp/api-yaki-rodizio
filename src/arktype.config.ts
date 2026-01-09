import { configure } from 'arktype/config';

configure({
	onUndeclaredKey: 'delete',
	exactOptionalPropertyTypes: false,
	toJsonSchema: {
		fallback: {
			default: (value) => value.base,
			domain: (value) => {
				if (value.domain === 'bigint') {
					return { type: 'integer', format: 'int64' };
				}
				return value.base;
			},
		},
	},
});
