import { createModule } from '../core/create-module.js';
import { z } from 'zod';
import { and, desc, eq, isNull } from 'drizzle-orm';

export function roundModule() {
	return createModule({
		name: 'rounds',
		prefix: 'v1/rounds',
	})
		.get(
			'/:roundId/items',
			async ({ params, db }) => {
				const orderItems = await db.query.roundItem.findMany({
					where: {
						roundId: params.roundId,
						deletedAt: {
							isNull: true,
						},
					},
				});
				return {
					orderItems,
				};
			},
			{
				auth: true,
				params: z.object({
					roundId: z.coerce.bigint(),
				}),
			},
		)
		.get(
			'/tables/:tableId/latest',
			async ({ params, db }) => {
				const w = db.$with('latest_round').as(
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
				const r = await db
					.with(w)
					.select()
					.from(db.schema.round)
					.innerJoin(w, eq(db.schema.round.roundId, w.latestRoundId))
					.innerJoin(
						db.schema.roundItem,
						eq(db.schema.roundItem.roundId, db.schema.round.roundId),
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
					.orderBy(desc(db.schema.round.createdAt));

				return r;
			},
			{
				params: z.object({
					tableId: z.coerce.bigint(),
				}),
				auth: true,
			},
		);
}
