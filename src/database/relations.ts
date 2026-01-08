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
		rounds: r.many.round({
			from: r.order.orderId,
			to: r.round.orderId,
		}),
	},
	table: {
		orders: r.many.order({
			from: r.table.tableId,
			to: r.order.tableId,
		}),
	},
	round: {
		order: r.one.order({
			from: r.round.orderId,
			to: r.order.orderId,
			optional: false,
		}),
		roundItems: r.many.roundItem({
			from: r.round.roundId,
			to: r.roundItem.roundId,
		}),
	},
	roundItem: {
		product: r.one.product({
			from: r.roundItem.productId,
			to: r.product.productId,
		}),
		round: r.one.round({
			from: r.roundItem.roundId,
			to: r.round.roundId,
		}),
	},
}));
