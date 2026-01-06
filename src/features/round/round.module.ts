import { createModule } from '../core/create-module.js';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { type } from 'arktype';
import { errorsSchemas } from '../core/errors.schemas.js';
import { createErrors } from '../core/create-errors.js';

const errors = createErrors({
	roundNotFound: {
		code: 'ROUND-0001',
		message: 'Round not found.',
		status: 404,
	},
});

export function roundModule() {
	return createModule({
		name: 'rounds',
		prefix: 'v1/rounds',
	}).get(
		'/tables/:tableId/latest',
		async ({ params, db }) => {
			const withLatestRound = db.$with('latest_round').as(
				db
					.select({ latestRoundId: db.schema.round.roundId })
					.from(db.schema.round)
					.innerJoin(
						db.schema.order,
						eq(db.schema.order.orderId, db.schema.round.orderId),
					)
					.innerJoin(
						db.schema.table,
						eq(db.schema.table.tableId, db.schema.order.tableId),
					)
					.where(
						and(
							eq(db.schema.table.tableId, params.tableId),
							isNull(db.schema.round.deletedAt),
							isNull(db.schema.order.deletedAt),
						),
					)
					.orderBy(desc(db.schema.round.roundId))
					.limit(1),
			);
			const results = await db
				.with(withLatestRound)
				.select()
				.from(db.schema.round)
				.innerJoin(
					withLatestRound,
					eq(db.schema.round.roundId, withLatestRound.latestRoundId),
				)
				.innerJoin(
					db.schema.roundItem,
					eq(db.schema.roundItem.roundId, db.schema.round.roundId),
				)
				.innerJoin(
					db.schema.product,
					eq(db.schema.product.productId, db.schema.roundItem.productId),
				)
				.innerJoin(
					db.schema.order,
					eq(db.schema.order.orderId, db.schema.round.orderId),
				)
				.innerJoin(
					db.schema.table,
					eq(db.schema.table.tableId, db.schema.order.tableId),
				)
				.where(
					and(
						eq(db.schema.table.tableId, params.tableId),
						isNull(db.schema.round.deletedAt),
						isNull(db.schema.order.deletedAt),
						isNull(db.schema.roundItem.deletedAt),
					),
				)
				.orderBy(desc(db.schema.roundItem.roundItemId));

			const first = results.at(0);

			if (!first) {
				return errors.roundNotFound();
			}

			return {
				round: {},
			};

			// return {
			// 	round: {
			// 		...first.round,
			// 		order: first.order,
			// 		table: first.table,
			// 		roundItems: results.map((item) => ({
			// 			...item.round_item,
			// 			product: item.product,
			// 		})),
			// 	},
			// };
		},
		{
			params: type({
				tableId: type('string.integer', '=>', BigInt),
			}),
			auth: true,
			response: {
				...errorsSchemas,
				200: type({
					round: type({}),
				}),
			},
		},
	);
}
