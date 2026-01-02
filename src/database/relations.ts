import { defineRelations } from 'drizzle-orm';
import * as schemas from './schemas.js';

export const relations = defineRelations(schemas, (r) => ({
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
