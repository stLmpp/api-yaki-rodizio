import { defineRelations } from 'drizzle-orm';
import * as schemas from './schemas.js';

export const relations = defineRelations(schemas, (r) => ({
	user: {
		sessions: r.many.session({
			from: r.user.id,
			to: r.session.userId,
		}),
		accounts: r.many.account({
			from: r.user.id,
			to: r.account.userId,
		}),
	},
	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id,
		}),
	},
	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id,
		}),
	},
	product: {
		productCategory: r.one.productCategory({
			from: r.product.productCategoryId,
			to: r.productCategory.productCategoryId,
		}),
	},
	productCategory: {
		products: r.many.product({
			from: r.productCategory.productCategoryId,
			to: r.product.productCategoryId,
		}),
	},
	order: {
		table: r.one.table({
			from: r.order.tableId,
			to: r.table.tableId,
		}),
	},
	table: {
		orders: r.many.order({
			from: r.table.tableId,
			to: r.order.tableId,
		}),
	},
}));
