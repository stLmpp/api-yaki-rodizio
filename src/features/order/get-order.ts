import { createRoute } from '../core/create-route.js';
import { errorsSchemas } from '../core/errors.schemas.js';
import { type } from 'arktype';
import { bigintParamType } from '../../lib/types.js';
import { ConstraintType } from '../../domain/constraint-type.js';
import { and, eq, isNull } from 'drizzle-orm';
import { orderErrors } from './order-errors.js';

export const getOrder = createRoute().get(
	'/:orderId',
	async ({ params, db }) => {
		const results = await db
			.select()
			.from(db.schema.order)
			.leftJoin(
				db.schema.orderConstraint,
				and(
					eq(db.schema.orderConstraint.orderId, db.schema.order.orderId),
					isNull(db.schema.orderConstraint.deletedAt),
				),
			)
			.leftJoin(
				db.schema.constraint,
				and(
					eq(
						db.schema.constraint.constraintId,
						db.schema.orderConstraint.constraintId,
					),
					isNull(db.schema.constraint.deletedAt),
				),
			)
			.where(
				and(
					eq(db.schema.order.orderId, params.orderId),
					isNull(db.schema.order.deletedAt),
				),
			);

		const first = results.at(0);

		if (!first) {
			return orderErrors.orderNotFound();
		}

		const maxConstraint = results.find(
			(result) => result.constraint?.constraintType === ConstraintType.Max,
		)?.constraint?.constraintValue.max;
		const minConstraint = results.find(
			(result) => result.constraint?.constraintType === ConstraintType.Min,
		)?.constraint?.constraintValue.min;

		return {
			order: {
				orderId: first.order.orderId,
				maxQuantity: maxConstraint ?? undefined,
				minQuantity: minConstraint ?? undefined,
			},
		};
	},
	{
		auth: true,
		params: type({
			orderId: bigintParamType,
		}),
		response: {
			...errorsSchemas,
			200: type({
				order: type({
					orderId: 'bigint',
					'maxQuantity?': 'number',
					'minQuantity?': 'number',
				}),
			}),
		},
	},
);
