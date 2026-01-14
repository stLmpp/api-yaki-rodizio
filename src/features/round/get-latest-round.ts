import { and, desc, eq, isNull } from 'drizzle-orm';
import { type } from 'arktype';
import { bigintParamType } from '../../lib/types.js';
import { roundErrors } from './round-errors.js';
import { errorsSchemas } from '../core/errors.schemas.js';
import { createRoute } from '../core/create-route.js';

export const getLatestRound = createRoute().get(
	'/tables/:tableId/latest',
	async function getLatestRound({ params, db }) {
		const table = await db.query.table.findFirst({
			columns: { tableId: true },
			where: {
				deletedAt: { isNull: true },
				tableId: params.tableId,
			},
		});
		if (!table) {
			return roundErrors.tableNotFound();
		}
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
			.innerJoin(
				db.schema.productCategory,
				eq(
					db.schema.productCategory.productCategoryId,
					db.schema.product.productCategoryId,
				),
			)
			.where(
				and(
					eq(db.schema.table.tableId, params.tableId),
					isNull(db.schema.round.deletedAt),
					isNull(db.schema.order.deletedAt),
					isNull(db.schema.roundItem.deletedAt),
					isNull(db.schema.product.deletedAt),
					isNull(db.schema.productCategory.deletedAt),
				),
			)
			.orderBy(desc(db.schema.roundItem.roundItemId));

		const first = results.at(0);

		if (!first) {
			return roundErrors.roundNotFound();
		}

		// return {
		// 	round: {},
		// };

		return {
			round: {
				tableId: first.table.tableId,
				roundId: first.round.roundId,
				orderId: first.order.orderId,
			},
		};
	},
	{
		params: type({
			tableId: bigintParamType,
		}),
		auth: true,
		response: {
			...errorsSchemas,
			200: type({
				round: type({
					tableId: 'bigint',
					roundId: 'bigint',
					orderId: 'bigint',
				}),
			}),
		},
	},
);
