import { createModule } from '../core/create-module.js';
import { AuthRole } from '../../lib/create-auth.js';
import { type } from 'arktype';
import { bigintParamType } from '../../lib/types.js';
import { roundErrors } from './round-errors.js';
import { RoundStatus } from '../../domain/round-status.js';
import { and, inArray } from 'drizzle-orm';
import { errorsSchemas } from '../core/errors.schemas.js';

export const postCloseRound = createModule().post(
	'/:roundId/next',
	async ({ params, db }) => {
		const round = await db.query.round.findFirst({
			columns: {
				roundStatusId: true,
				roundId: true,
			},
			where: {
				roundId: params.roundId,
				deletedAt: { isNull: true },
				order: { deletedAt: { isNull: true } },
			},
			with: {
				order: {
					columns: {
						orderStatusId: true,
						orderId: true,
					},
				},
			},
		});
		if (!round) {
			return roundErrors.roundNotFound();
		}
		if (round.order.orderStatusId === RoundStatus.Finished) {
			return roundErrors.orderAlreadyFinished();
		}
		if (round.roundStatusId === RoundStatus.Waiting) {
			return roundErrors.roundIsWaiting();
		}
		if (round.roundStatusId === RoundStatus.Finished) {
			return roundErrors.roundAlreadyFinished();
		}
		const roundsToFinish = await db.query.round.findMany({
			columns: {
				roundId: true,
				roundNumber: true,
			},
			where: {
				orderId: round.order.orderId,
				roundStatusId: {
					in: [RoundStatus.Serving],
				},
				deletedAt: { isNull: true },
			},
			orderBy: { roundNumber: 'asc' },
		});
		const latestRoundNumber = roundsToFinish.at(-1)?.roundNumber ?? 0;
		const roundIdsToFinish = roundsToFinish.map((round) => round.roundId);
		const { roundId } = await db.transaction(async (trx) => {
			const [roundsInserted] = await Promise.all([
				trx
					.insert(db.schema.round)
					.values({
						roundStatusId: RoundStatus.Waiting,
						orderId: round.order.orderId,
						roundNumber: latestRoundNumber + 1,
					})
					.returning({ roundId: db.schema.round.roundId }),
				trx
					.update(db.schema.round)
					.set({ roundStatusId: RoundStatus.Finished })
					.where(and(inArray(db.schema.round.roundId, roundIdsToFinish))),
			]);
			return { roundId: roundsInserted[0].roundId };
		});
		return { nextRoundId: roundId };
	},
	{
		auth: [AuthRole.Admin],
		params: type({ roundId: bigintParamType }),
		response: {
			...errorsSchemas,
			200: type({
				nextRoundId: 'bigint',
			}),
		},
	},
);
