import { createRoute } from '../core/create-route.js';
import { type } from 'arktype';
import { bigintParamType } from '../../lib/types.js';
import { errorsSchemas } from '../core/errors.schemas.js';
import { and, eq, isNull } from 'drizzle-orm';
import { roundErrors } from './round-errors.js';

const roundItemType = type({
	roundItemId: 'bigint',
	roundId: 'bigint',
	quantity: 'number',
	productId: 'bigint',
	productCategoryId: 'bigint',
});

export const getRoundWithItems = createRoute().get(
	'/:roundId/items',
	async ({ params, db }) => {
		const results = await db
			.select({
				round: {
					roundId: db.schema.round.roundId,
				},
				roundItem: {
					roundItemId: db.schema.roundItem.roundItemId,
					roundId: db.schema.roundItem.roundId,
					quantity: db.schema.roundItem.quantity,
					productId: db.schema.roundItem.productId,
				},
				product: {
					productCategoryId: db.schema.product.productCategoryId,
				},
			})
			.from(db.schema.round)
			.leftJoin(
				db.schema.roundItem,
				and(
					eq(db.schema.roundItem.roundId, db.schema.round.roundId),
					isNull(db.schema.roundItem.deletedAt),
				),
			)
			.leftJoin(
				db.schema.product,
				and(
					eq(db.schema.product.productId, db.schema.roundItem.productId),
					isNull(db.schema.product.deletedAt),
				),
			)
			.where(
				and(
					eq(db.schema.round.roundId, params.roundId),
					isNull(db.schema.round.deletedAt),
				),
			);
		const first = results.at(0);
		if (!first) {
			return roundErrors.roundNotFound();
		}
		const items: Array<typeof roundItemType.infer> = [];
		for (const { roundItem, product } of results) {
			if (!roundItem || !product) {
				continue;
			}
			items.push({
				roundItemId: roundItem.roundItemId,
				roundId: roundItem.roundId,
				productCategoryId: product.productCategoryId,
				quantity: roundItem.quantity,
				productId: roundItem.productId,
			});
		}
		return {
			round: {
				roundId: first.round.roundId,
				items,
			},
		};
	},
	{
		auth: true,
		params: type({ roundId: bigintParamType }),
		response: {
			...errorsSchemas,
			200: type({
				round: type({
					roundId: 'bigint',
					items: roundItemType.array(),
				}),
			}),
		},
	},
);
