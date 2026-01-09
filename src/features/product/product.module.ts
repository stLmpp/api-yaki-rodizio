import { createModule } from '../core/create-module.js';
import { getProductWithCategoriesTree } from './get-product-with-categories-tree.js';

export function productModule() {
	return createModule({
		name: 'products',
		prefix: 'v1/products',
		tags: ['Products'],
	}).use(getProductWithCategoriesTree);
}
