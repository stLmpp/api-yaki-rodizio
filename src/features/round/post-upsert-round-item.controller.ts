import { createModule } from '../core/create-module.js';
import { type } from 'arktype';
import { bigintParamType } from '../../lib/types.js';
import { and, eq } from 'drizzle-orm';
import { errorsSchemas } from '../core/errors.schemas.js';
import { roundErrors } from './round-errors.js';
import { RoundStatus } from '../../domain/round-status.js';

export const postUpsertRoundItemController = createModule().post(
	'/:roundId/item',
	async ({ params, body, db }) => {
		if (body.roundItemId === undefined) {
			const roundItem = await db.query.roundItem.findFirst({
				columns: { roundItemId: true },
				where: {
					productId: body.productId,
					roundId: params.roundId,
				},
			});
			if (!roundItem) {
				const [roundItem] = await db
					.insert(db.schema.roundItem)
					.values({
						productId: body.productId,
						roundId: params.roundId,
						quantity: body.quantity,
					})
					.returning({ roundItemId: db.schema.roundItem.roundItemId });
				return { roundItemId: roundItem.roundItemId };
			}
			body.roundItemId = roundItem.roundItemId;
		}
		if (body.roundItemId) {
			const roundItem = await db.query.roundItem.findFirst({
				columns: {
					roundItemId: true,
				},
				where: {
					roundItemId: body.roundItemId,
					deletedAt: { isNull: true },
					round: { deletedAt: { isNull: true } },
				},
				with: {
					round: {
						columns: {
							roundStatusId: true,
						},
					},
				},
			});
			if (!roundItem) {
				return roundErrors.roundItemNotFound();
			}
			if (roundItem.round.roundStatusId !== RoundStatus.Waiting) {
				return roundErrors.roundIsNotWaiting();
			}
			await db
				.update(db.schema.roundItem)
				.set({
					quantity: body.quantity,
				})
				.where(and(eq(db.schema.roundItem.roundItemId, body.roundItemId)));
		}
		return { roundItemId: body.roundItemId };
	},
	{
		auth: true,
		params: type({ roundId: bigintParamType }),
		body: type({
			'roundItemId?': bigintParamType,
			productId: bigintParamType,
			roundId: bigintParamType,
			quantity: 'number.integer >= 1',
		}),
		response: {
			...errorsSchemas,
			200: type({
				roundItemId: bigintParamType,
			}),
		},
	},
);
