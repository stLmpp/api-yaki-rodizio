import {
	bigint,
	bigserial,
	index,
	pgTable,
	timestamp,
} from 'drizzle-orm/pg-core';

const common = {
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp()
		.defaultNow()
		.$onUpdateFn(() => new Date()),
	createdBy: bigint({ mode: 'bigint' }),
	updatedBy: bigint({ mode: 'bigint' }),
};

export const menuItem = pgTable('menu_item', (t) => ({
	...common,
	menuItemId: t
		.bigserial({
			mode: 'bigint',
		})
		.primaryKey(),
	name: t.varchar({ length: 127 }).notNull(),
	description: t.varchar({ length: 4096 }),
}));

export const table = pgTable('table', (t) => ({
	...common,
	tableId: t.bigserial({ mode: 'bigint' }).primaryKey(),
}));

export const order = pgTable(
	'order',
	(t) => ({
		...common,
		orderId: t.bigserial({ mode: 'bigint' }).primaryKey(),
		tableId: t.bigserial({ mode: 'bigint' }).references(() => table.tableId),
	}),
	(t) => ({
		tableIdIdx: index('order_table_id_idx').on(t.tableId),
	}),
);
