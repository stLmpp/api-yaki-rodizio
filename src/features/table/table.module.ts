import { createModule } from '../core/create-module.js';
import { postCreateTable } from './post-create-table.js';
import { getTableIdBy } from './get-table-by-id.js';

export function tableModule() {
	return createModule({
		name: 'tables',
		prefix: 'v1/tables',
		tags: ['Tables'],
	})
		.use(postCreateTable)
		.use(getTableIdBy);
}
