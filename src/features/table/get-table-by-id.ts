import { type } from 'arktype';
import { bigintParamType } from '../../lib/types.js';
import { errorsSchemas } from '../core/errors.schemas.js';
import { tableErrors } from './table-errors.js';
import { createRoute } from '../core/create-route.js';

export const getTableIdBy = createRoute().get(
	'/:tableId',
	async ({ params, db }) => {
		const table = await db.query.table.findFirst({
			columns: {
				tableId: true,
				tableDescription: true,
			},
			where: {
				tableId: params.tableId,
				deletedAt: { isNull: true },
			},
		});
		if (!table) {
			return tableErrors.tableNotFound();
		}
		return {
			table: {
				tableId: table.tableId,
				tableDescription: table.tableDescription ?? undefined,
			},
		};
	},
	{
		auth: true,
		params: type({ tableId: bigintParamType }),
		response: {
			...errorsSchemas,
			200: type({
				table: type({
					tableId: 'bigint',
					'tableDescription?': 'string',
				}),
			}),
		},
	},
);
