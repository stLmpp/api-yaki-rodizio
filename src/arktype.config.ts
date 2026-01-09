import { configure } from 'arktype/config';

configure({
	onUndeclaredKey: 'delete',
	toJsonSchema: {
		fallback: {
			domain: (value) => {
				if (value.domain === 'bigint') {
					return { type: 'integer', format: 'int64' };
				}
				return value.base;
			},
		},
	},
});
