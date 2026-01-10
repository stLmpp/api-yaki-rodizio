import { createModule } from '../core/create-module.js';
import { AuthRole } from '../../lib/create-auth.js';
import { bigintParamType } from '../../lib/types.js';
import { type } from 'arktype';
import { errorsSchemas } from '../core/errors.schemas.js';
import { orderErrors } from './order-errors.js';
import { OrderStatus } from '../../domain/order-status.js';
import { RoundStatus } from '../../domain/round-status.js';
import { inArray } from 'drizzle-orm';

export const postCreateOrder = createModule().post(
	'/',
	async ({ db, body }) => {
		const table = await db.query.table.findFirst({
			columns: { tableId: true },
			where: { tableId: body.tableId, deletedAt: { isNull: true } },
			with: {
				orders: {
					columns: { orderId: true },
					where: {
						deletedAt: { isNull: true },
						orderStatusId: { NOT: OrderStatus.Finished },
					},
					with: {
						rounds: {
							columns: { roundId: true },
							where: {
								deletedAt: { isNull: true },
								roundStatusId: { NOT: RoundStatus.Finished },
							},
						},
					},
				},
			},
		});

		if (!table) {
			return orderErrors.tableNotFound();
		}

		const { orderId } = await db.transaction(async (trx) => {
			const promises: Promise<unknown>[] = [];
			const orderIdsToFinish = table.orders.map((order) => order.orderId);
			if (orderIdsToFinish.length) {
				promises.push(
					trx
						.update(db.schema.order)
						.set({ orderStatusId: OrderStatus.Finished })
						.where(inArray(db.schema.order.orderId, orderIdsToFinish)),
				);
			}
			const roundIdsToFinish = table.orders.flatMap((order) =>
				order.rounds.map((round) => round.roundId),
			);
			if (roundIdsToFinish.length) {
				promises.push(
					trx
						.update(db.schema.round)
						.set({ roundStatusId: RoundStatus.Finished })
						.where(inArray(db.schema.round.roundId, roundIdsToFinish)),
				);
			}
			await Promise.all(promises);
			const [[order]] = await Promise.all([
				trx
					.insert(db.schema.order)
					.values({ tableId: body.tableId, orderStatusId: OrderStatus.Waiting })
					.returning({ orderId: db.schema.order.orderId }),
				...promises,
			]);
			await trx.insert(db.schema.round).values({
				orderId: order.orderId,
				roundStatusId: RoundStatus.Waiting,
				roundNumber: 1,
			});
			return { orderId: order.orderId };
		});
		return { order: { orderId } };
	},
	{
		auth: [AuthRole.Admin],
		body: type({
			tableId: bigintParamType,
		}),
		response: {
			...errorsSchemas,
			200: type({
				order: type({
					orderId: 'bigint',
				}),
			}),
		},
	},
);
