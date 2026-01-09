import {
	foreignKey,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from 'drizzle-orm/pg-core';

const common = {
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdateFn(() => new Date()),
	deletedAt: timestamp('deleted_at'),
	// TODO find a way to automate this
	createdBy: text('created_by').notNull().default('unknown'),
	updatedBy: text('updated_by').default('unknown'),
};

export const constraintTypeEnum = pgEnum('constraint_type', ['MIN', 'MAX']);

export const constraint = pgTable('constraint', (t) => ({
	constraintId: t
		.bigint('constraint_id', { mode: 'bigint' })
		.primaryKey()
		.generatedAlwaysAsIdentity(),
	constraintDescription: t.varchar('constraint_description', { length: 1023 }),
	constraintType: constraintTypeEnum('constraint_type').notNull(),
	constraintValue: t
		.json('constraint_value')
		.notNull()
		.$type<{ max?: number; min?: number }>(),
	...common,
}));

export const productCategory = pgTable('product_category', (t) => ({
	productCategoryId: t
		.bigint('product_category_id', { mode: 'bigint' })
		.primaryKey()
		.generatedAlwaysAsIdentity(),
	productCategoryName: t
		.varchar('product_category_name', { length: 127 })
		.notNull(),
	productCategoryDescription: t.varchar('product_category_description', {
		length: 1023,
	}),
	...common,
}));

export const productCategoryConstraint = pgTable(
	'product_category_constraint',
	(t) => ({
		productCategoryConstraintId: t
			.bigint('product_category_constraint_id', { mode: 'bigint' })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		productCategoryId: t
			.bigint('product_category_id', { mode: 'bigint' })
			.notNull(),
		constraintId: t.bigint('constraint_id', { mode: 'bigint' }).notNull(),
		...common,
	}),
	(t) => [
		index().on(t.constraintId, t.deletedAt),
		foreignKey({
			columns: [t.constraintId],
			foreignColumns: [constraint.constraintId],
		}),
		foreignKey({
			columns: [t.productCategoryId],
			foreignColumns: [productCategory.productCategoryId],
		}),
		index().on(t.productCategoryId, t.deletedAt),
		index().on(t.constraintId, t.productCategoryId, t.deletedAt),
	],
);

export const product = pgTable(
	'product',
	(t) => ({
		productId: t
			.bigint('product_id', {
				mode: 'bigint',
			})
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		productCategoryId: t
			.bigint('product_category_id', { mode: 'bigint' })
			.notNull(),
		productName: t.varchar('product_name', { length: 127 }).notNull(),
		productDescription: t.varchar('product_description', { length: 4095 }),
		...common,
	}),
	(t) => [
		index().on(t.productCategoryId, t.deletedAt),
		foreignKey({
			columns: [t.productCategoryId],
			foreignColumns: [productCategory.productCategoryId],
		}),
	],
);

export const productConstraint = pgTable(
	'product_constraint',
	(t) => ({
		productConstraintId: t
			.bigint('product_constraint_id', { mode: 'bigint' })

			.primaryKey()
			.generatedAlwaysAsIdentity(),
		productId: t.bigint('product_id', { mode: 'bigint' }).notNull(),
		constraintId: t.bigint('constraint_id', { mode: 'bigint' }).notNull(),
		...common,
	}),
	(t) => [
		index().on(t.constraintId, t.deletedAt),
		foreignKey({
			columns: [t.constraintId],
			foreignColumns: [constraint.constraintId],
		}),
		index().on(t.productId, t.deletedAt),
		foreignKey({
			columns: [t.productId],
			foreignColumns: [product.productId],
		}),
		index().on(t.constraintId, t.productId, t.deletedAt),
	],
);

export const table = pgTable('table', (t) => ({
	tableId: t
		.bigint('table_id', { mode: 'bigint' })
		.primaryKey()
		.generatedAlwaysAsIdentity(),
	tableDescription: t.varchar('table_description', { length: 1023 }),
	...common,
}));

export const tableConstraint = pgTable(
	'table_constraint',
	(t) => ({
		tableConstraintId: t
			.bigint('table_constraint_id', { mode: 'bigint' })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		constraintId: t.bigint('constraint_id', { mode: 'bigint' }).notNull(),
		...common,
	}),
	(t) => [
		index().on(t.constraintId, t.deletedAt),
		foreignKey({
			columns: [t.constraintId],
			foreignColumns: [constraint.constraintId],
		}),
	],
);

export const orderStatus = pgTable('order_status', (t) => ({
	orderStatusId: t.varchar('order_status_id', { length: 23 }).primaryKey(),
	orderStatusName: t.varchar('order_status_name', { length: 127 }).notNull(),
	orderStatusDescription: t.varchar('order_status_description', {
		length: 1023,
	}),
	...common,
}));

export const order = pgTable(
	'order',
	(t) => ({
		orderId: t
			.bigint('order_id', { mode: 'bigint' })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		tableId: t.bigint('table_id', { mode: 'bigint' }).notNull(),
		orderStatusId: t.varchar('order_status_id', { length: 23 }).notNull(),
		...common,
	}),
	(t) => [
		index().on(t.tableId, t.deletedAt),
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
		orderConstraintId: t
			.bigint('order_constraint_id', { mode: 'bigint' })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		constraintId: t.bigint('constraint_id', { mode: 'bigint' }).notNull(),
		...common,
	}),
	(t) => [
		index().on(t.constraintId, t.deletedAt),
		foreignKey({
			columns: [t.constraintId],
			foreignColumns: [constraint.constraintId],
		}),
	],
);

export const roundStatus = pgTable('round_status', (t) => ({
	roundStatusId: t.varchar('round_status_id', { length: 23 }).primaryKey(),
	roundStatusName: t.varchar('round_status_name', { length: 127 }).notNull(),
	roundStatusDescription: t.varchar('round_status_description', {
		length: 1023,
	}),
	...common,
}));

export const round = pgTable(
	'round',
	(t) => ({
		roundId: t
			.bigint('round_id', { mode: 'bigint' })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		orderId: t.bigint('order_id', { mode: 'bigint' }).notNull(),
		roundStatusId: t.varchar('round_status_id', { length: 23 }).notNull(),
		roundNumber: t.smallint('round_number').notNull(),
		...common,
	}),
	(t) => [
		index().on(t.orderId, t.deletedAt),
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

export const roundItem = pgTable(
	'round_item',
	(t) => ({
		roundItemId: t
			.bigint('round_item_id', { mode: 'bigint' })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		productId: t.bigint('product_id', { mode: 'bigint' }).notNull(),
		roundId: t.bigint('round_id', { mode: 'bigint' }).notNull(),
		quantity: t.integer('quantity').notNull(),
		...common,
	}),
	(t) => [
		index().on(t.roundId, t.deletedAt),
		foreignKey({
			columns: [t.productId],
			foreignColumns: [product.productId],
		}),
		foreignKey({
			columns: [t.roundId],
			foreignColumns: [round.roundId],
		}),
		index().on(t.productId, t.roundId, t.deletedAt),
	],
);
