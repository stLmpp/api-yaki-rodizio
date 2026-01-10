import { createModule } from '../core/create-module.js';
import { postCreateTable } from './post-create-table.js';

export function tableModule() {
	return createModule({
		name: 'tables',
		prefix: 'v1/tables',
		tags: ['Tables'],
	}).use(postCreateTable);
}
