import { reset, seed } from 'drizzle-seed';
import * as dotenv from 'dotenv';
import { createDb, createDbPgClient } from '../src/database/db.js';
import * as schemas from '../src/database/schemas.js';
import { PgTable } from 'drizzle-orm/pg-core';
import { RoundStatus } from '../src/domain/round-status.js';
import { OrderStatus } from '../src/domain/order-status.js';

dotenv.config();

async function seed_internal() {
	const db = createDbPgClient(process.env.DATABASE_URL!);
	await seed(db, schemas, {
		count: 100_000,
	}).refine((r) => {
		const tables = Object.fromEntries(
			Object.entries(schemas)
				.filter(([, schema]) => schema instanceof PgTable)
				.map(([key]) => [
					key,
					{
						columns: {
							deletedAt: r.default({ defaultValue: undefined }),
							createdBy: r.default({ defaultValue: '1' }),
							updatedBy: r.default({ defaultValue: '1' }),
						},
					},
				]),
		);

		return {
			...tables,
			orderStatus: undefined,
			roundStatus: undefined,
			table: {
				...tables.table,
				columns: {
					...tables.table.columns,
					tableDescription: r.loremIpsum(),
				},
			},
			constraint: {
				...tables.constraint,
				columns: {
					...tables.constraint.columns,
					constraintType: r.valuesFromArray({
						values: ['MIN', 'MAX'],
					}),
					constraintValue: r.default({
						defaultValue: JSON.stringify({ max: 1, min: 2 }),
					}),
				},
				count: 10,
			},
			productConstraint: {
				...tables.productConstraint,
				count: 10,
			},
			productCategoryConstraint: {
				...tables.productCategoryConstraint,
				count: 10,
			},
			roundItem: {
				...tables.roundItem,
				columns: {
					...tables.roundItem.columns,
					quantity: r.int({ minValue: 1, maxValue: 100 }),
				},
				count: 200,
			},
			round: {
				...tables.round,
				columns: {
					...tables.round.columns,
					roundStatusId: r.valuesFromArray({
						values: Object.values(RoundStatus),
					}),
					roundNumber: r.int({ minValue: 1, maxValue: 5 }),
				},
			},
			order: {
				...tables.order,
				columns: {
					...tables.order.columns,
					orderStatusId: r.valuesFromArray({
						values: Object.values(OrderStatus),
					}),
				},
			},
			product: {
				...tables.product,
				columns: {
					...tables.product.columns,
					productName: r.valuesFromArray({
						values: ['Salmao', 'Prego', 'Philadelphia', 'Couve'],
					}),
					productDescription: r.loremIpsum(),
				},
				count: 100,
			},
			productCategory: {
				...tables.productCategory,
				columns: {
					...tables.productCategory.columns,
					productCategoryName: r.valuesFromArray({
						values: ['Sashimi', 'Uramaki'],
					}),
					productCategoryDescription: r.loremIpsum(),
				},
				count: 20,
			},
		};
	});
}

(async () => {
	const db = createDb(process.env.DATABASE_URL!);
	await reset(db, schemas);
	await db.insert(db.schema.orderStatus).values(
		Object.values(OrderStatus).map((status) => ({
			orderStatusId: status,
			orderStatusName: status,
		})),
	);
	await db.insert(db.schema.roundStatus).values(
		Object.values(RoundStatus).map((status) => ({
			roundStatusId: status,
			roundStatusName: status,
		})),
	);
	await seed_internal();
})();
