import {
	bigint,
	foreignKey,
	index,
	pgEnum,
	pgTable,
	timestamp,
} from 'drizzle-orm/pg-core';

const common = {
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp()
		.defaultNow()
		.$onUpdateFn(() => new Date()),
	deletedAt: timestamp(),
	createdBy: bigint({ mode: 'bigint' }),
	updatedBy: bigint({ mode: 'bigint' }),
};

export const constraintTypeEnum = pgEnum('constraint_type', ['MAX', 'MIN']);

export const constraint = pgTable('constraint', (t) => ({
	constraintId: t.bigserial({ mode: 'bigint' }).primaryKey(),
	constraintDescription: t.varchar({ length: 1023 }),
	constraintType: constraintTypeEnum().notNull(),
	constraintValue: t.json().notNull(),
	...common,
}));

export const productCategory = pgTable('product_category', (t) => ({
	productCategoryId: t.bigserial({ mode: 'bigint' }).primaryKey(),
	productCategoryName: t.varchar({ length: 127 }).notNull(),
	productCategoryDescription: t.varchar({ length: 1023 }),
	...common,
}));

export const productCategoryConstraint = pgTable(
	'product_category_constraint',
	(t) => ({
		productCategoryConstraintId: t.bigserial({ mode: 'bigint' }).primaryKey(),
		constraintId: t.bigint({ mode: 'bigint' }).notNull(),
		...common,
	}),
	(t) => [
		index().on(t.constraintId),
		foreignKey({
			columns: [t.constraintId],
			foreignColumns: [constraint.constraintId],
		}),
	],
);

export const product = pgTable(
	'product',
	(t) => ({
		productId: t
			.bigserial({
				mode: 'bigint',
			})
			.primaryKey(),
		productCategoryId: t.bigint({ mode: 'bigint' }).notNull(),
		productName: t.varchar({ length: 127 }).notNull(),
		productDescription: t.varchar({ length: 4095 }),
		...common,
	}),
	(t) => [
		index().on(t.productCategoryId),
		foreignKey({
			columns: [t.productCategoryId],
			foreignColumns: [productCategory.productCategoryId],
		}),
	],
);

export const productConstraint = pgTable(
	'product_constraint',
	(t) => ({
		productConstraintId: t.bigserial({ mode: 'bigint' }).primaryKey(),
		constraintId: t.bigint({ mode: 'bigint' }).notNull(),
		...common,
	}),
	(t) => [
		index().on(t.constraintId),
		foreignKey({
			columns: [t.constraintId],
			foreignColumns: [constraint.constraintId],
		}),
	],
);

export const table = pgTable('table', (t) => ({
	tableId: t.bigint({ mode: 'bigint' }).primaryKey(),
	tableDescription: t.varchar({ length: 1023 }),
	...common,
}));

export const tableConstraint = pgTable(
	'table_constraint',
	(t) => ({
		tableConstraintId: t.bigserial({ mode: 'bigint' }).primaryKey(),
		constraintId: t.bigint({ mode: 'bigint' }).notNull(),
		...common,
	}),
	(t) => [
		index().on(t.constraintId),
		foreignKey({
			columns: [t.constraintId],
			foreignColumns: [constraint.constraintId],
		}),
	],
);

export const orderStatus = pgTable('order_status', (t) => ({
	orderStatusId: t.varchar({ length: 23 }).primaryKey(),
	orderStatusName: t.varchar({ length: 127 }).notNull(),
	orderStatusDescription: t.varchar({ length: 1023 }),
	...common,
}));

export const order = pgTable(
	'order',
	(t) => ({
		orderId: t.bigserial({ mode: 'bigint' }).primaryKey(),
		tableId: t.bigint({ mode: 'bigint' }).notNull(),
		orderStatusId: t.varchar({ length: 23 }).notNull(),
		...common,
	}),
	(t) => [
		index().on(t.tableId, t.orderStatusId),
		foreignKey({
			columns: [t.tableId],
			foreignColumns: [table.tableId],
		}),
		foreignKey({
			columns: [t.orderStatusId],
			foreignColumns: [orderStatus.orderStatusId],
		}),
	],
);

export const orderConstraint = pgTable(
	'order_constraint',
	(t) => ({
		orderConstraintId: t.bigserial({ mode: 'bigint' }).primaryKey(),
		constraintId: t.bigint({ mode: 'bigint' }).notNull(),
		...common,
	}),
	(t) => [
		index().on(t.constraintId),
		foreignKey({
			columns: [t.constraintId],
			foreignColumns: [constraint.constraintId],
		}),
	],
);

export const roundStatus = pgTable('round_status', (t) => ({
	roundStatusId: t.varchar({ length: 23 }).primaryKey(),
	roundStatusName: t.varchar({ length: 127 }).notNull(),
	roundStatusDescription: t.varchar({ length: 1023 }),
	...common,
}));

export const round = pgTable(
	'round',
	(t) => ({
		roundId: t.bigserial({ mode: 'bigint' }).primaryKey(),
		orderId: t.bigint({ mode: 'bigint' }).notNull(),
		roundStatusId: t.varchar({ length: 23 }).notNull(),
		...common,
	}),
	(t) => [
		index().on(t.roundStatusId, t.orderId),
		foreignKey({
			columns: [t.orderId],
			foreignColumns: [order.orderId],
		}),
		foreignKey({
			columns: [t.roundStatusId],
			foreignColumns: [roundStatus.roundStatusId],
		}),
	],
);

export const orderItem = pgTable(
	'order_item',
	(t) => ({
		orderItemId: t.bigserial({ mode: 'bigint' }).primaryKey(),
		orderId: t.bigint({ mode: 'bigint' }).notNull(),
		productId: t.bigint({ mode: 'bigint' }).notNull(),
		roundId: t.bigint({ mode: 'bigint' }).notNull(),
		quantity: t.integer().notNull(),
		...common,
	}),
	(t) => [
		index().on(t.roundId),
		foreignKey({
			columns: [t.orderId],
			foreignColumns: [order.orderId],
		}),
		foreignKey({
			columns: [t.productId],
			foreignColumns: [product.productId],
		}),
		foreignKey({
			columns: [t.roundId],
			foreignColumns: [round.roundId],
		}),
	],
);
