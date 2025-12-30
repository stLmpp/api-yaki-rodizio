import {
	bigint,
	foreignKey,
	index,
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

export const productCategory = pgTable('product_category', (t) => ({
	...common,
	productCategoryId: t.bigserial({ mode: 'bigint' }).primaryKey(),
	name: t.varchar({ length: 127 }).notNull(),
	description: t.varchar({ length: 1023 }),
}));

export const product = pgTable(
	'product',
	(t) => ({
		...common,
		productId: t
			.bigserial({
				mode: 'bigint',
			})
			.primaryKey(),
		productCategoryId: t.bigserial({ mode: 'bigint' }).notNull(),
		name: t.varchar({ length: 127 }).notNull(),
		description: t.varchar({ length: 4095 }),
	}),
	(t) => [
		index().on(t.productCategoryId),
		foreignKey({
			columns: [t.productCategoryId],
			foreignColumns: [productCategory.productCategoryId],
		}),
	],
);

export const table = pgTable('table', (t) => ({
	...common,
	tableId: t.bigserial({ mode: 'bigint' }).primaryKey(),
}));

export const orderStatus = pgTable('order_status', (t) => ({
	...common,
	orderStatusId: t.varchar({ length: 23 }).primaryKey(),
	name: t.varchar({ length: 127 }).notNull(),
	description: t.varchar({ length: 1023 }),
}));

export const order = pgTable(
	'order',
	(t) => ({
		...common,
		orderId: t.bigserial({ mode: 'bigint' }).primaryKey(),
		tableId: t.bigserial({ mode: 'bigint' }).notNull(),
		orderStatusId: t.varchar({ length: 23 }).notNull(),
	}),
	(t) => [
		index().on(t.tableId),
		foreignKey({
			columns: [t.tableId],
			foreignColumns: [table.tableId],
		}),
		index().on(t.orderStatusId),
		foreignKey({
			columns: [t.orderStatusId],
			foreignColumns: [orderStatus.orderStatusId],
		}),
	],
);

export const roundStatus = pgTable('round_status', (t) => ({
	...common,
	roundStatusId: t.varchar({ length: 23 }).primaryKey(),
	name: t.varchar({ length: 127 }).notNull(),
	description: t.varchar({ length: 1023 }),
}));

export const round = pgTable(
	'round',
	(t) => ({
		...common,
		roundId: t.bigserial({ mode: 'bigint' }).primaryKey(),
		orderId: t.bigserial({ mode: 'bigint' }).notNull(),
		roundStatusId: t.varchar({ length: 23 }).notNull(),
	}),
	(t) => [
		index().on(t.orderId),
		foreignKey({
			columns: [t.orderId],
			foreignColumns: [order.orderId],
		}),
		index().on(t.roundStatusId),
		foreignKey({
			columns: [t.roundStatusId],
			foreignColumns: [roundStatus.roundStatusId],
		}),
	],
);

export const orderItem = pgTable(
	'order_item',
	(t) => ({
		...common,
		orderItemId: t.bigserial({ mode: 'bigint' }).primaryKey(),
		orderId: t.bigserial({ mode: 'bigint' }).notNull(),
		productId: t.bigserial({ mode: 'bigint' }).notNull(),
		roundId: t.bigserial({ mode: 'bigint' }).notNull(),
		quantity: t.integer().notNull(),
	}),
	(t) => [
		index().on(t.orderId),
		foreignKey({
			columns: [t.orderId],
			foreignColumns: [order.orderId],
		}),
		index().on(t.productId),
		foreignKey({
			columns: [t.productId],
			foreignColumns: [product.productId],
		}),
		index().on(t.roundId),
		foreignKey({
			columns: [t.roundId],
			foreignColumns: [round.roundId],
		}),
	],
);
