import { createModule } from '../core/create-module.js';
import { z } from 'zod';
import { and, eq, isNull } from 'drizzle-orm';

export function orderModule() {
	return createModule({
		name: 'order',
		prefix: 'v1/order',
	}).get(
		'/:orderId/rounds/:roundId/items',
		async ({ params, db }) => {
			const orderItems = await db
				.select()
				.from(db.schema.orderItem)
				.where((t) =>
					and(
						eq(t.orderId, params.orderId),
						eq(t.roundId, params.roundId),
						isNull(t.deletedAt),
					),
				);
			return {
				orderItems,
			};
		},
		{
			auth: true,
			params: z.object({
				orderId: z.coerce.bigint(),
				roundId: z.coerce.bigint(),
			}),
		},
	);
}
