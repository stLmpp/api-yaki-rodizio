import { createModule } from '../core/create-module.js';
import { postCreateOrder } from './post-create-order.js';

export function orderModule() {
	return createModule({
		name: 'orders',
		prefix: 'v1/orders',
		tags: ['Orders'],
	}).use(postCreateOrder);
}
