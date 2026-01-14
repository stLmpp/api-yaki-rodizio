import { AuthRole } from '../../lib/create-auth.js';
import { type } from 'arktype';
import { errorsSchemas } from '../core/errors.schemas.js';
import { createRoute } from '../core/create-route.js';

export const postCreateTable = createRoute().post(
	'/',
	async ({ db, body }) => {
		const [table] = await db
			.insert(db.schema.table)
			.values({
				tableDescription: body.tableDescription,
			})
			.returning({ tableId: db.schema.table.tableId });
		return {
			table: {
				tableId: table.tableId,
			},
		};
	},
	{
		auth: [AuthRole.Admin],
		body: type({
			tableDescription: '0 < string <= 1023',
		}),
		response: {
			...errorsSchemas,
			200: type({
				table: type({
					tableId: 'bigint',
				}),
			}),
		},
	},
);
