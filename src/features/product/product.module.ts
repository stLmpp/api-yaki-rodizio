import { createModule } from '../core/create-module.js';
import { getCategoryProductTree } from './get-category-product-tree.js';

export function productModule() {
	return createModule({
		name: 'products',
		prefix: 'v1/products',
		tags: ['Products'],
	}).use(getCategoryProductTree);
}
