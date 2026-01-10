import { createModule } from '../core/create-module.js';
import { bigintParamType } from '../../lib/types.js';
import { type } from 'arktype';
import { errorsSchemas } from '../core/errors.schemas.js';
import { roundErrors } from './round-errors.js';
import { RoundStatus } from '../../domain/round-status.js';
import { and, eq } from 'drizzle-orm';

export const patchUpdateRoundStatus = createModule().patch(
	'/:roundId/status',
	async ({ params, db, body }) => {
		const round = await db.query.round.findFirst({
			columns: { roundId: true, roundStatusId: true },
			where: {
				roundId: params.roundId,
				deletedAt: { isNull: true },
				order: { deletedAt: { isNull: true } },
			},
			with: {
				order: true,
			},
		});
		if (!round) {
			return roundErrors.roundNotFound();
		}
		if (round.roundStatusId === RoundStatus.Finished) {
			return roundErrors.roundAlreadyFinished();
		}
		if (
			round.roundStatusId === RoundStatus.Waiting &&
			body.roundStatusId === RoundStatus.Finished
		) {
			return roundErrors.roundIsWaiting();
		}
		await db
			.update(db.schema.round)
			.set({
				roundStatusId: body.roundStatusId,
			})
			.where(and(eq(db.schema.round.roundId, params.roundId)));
		return {
			roundId: round.roundId,
			roundStatusId: body.roundStatusId,
		};
	},
	{
		auth: true,
		body: type({
			roundStatusId: type.enumerated(RoundStatus.Serving, RoundStatus.Finished),
		}),
		params: type({ roundId: bigintParamType }),
		response: {
			...errorsSchemas,
			200: type({
				roundId: bigintParamType,
				roundStatusId: type.enumerated(
					RoundStatus.Serving,
					RoundStatus.Finished,
				),
			}),
		},
	},
);
