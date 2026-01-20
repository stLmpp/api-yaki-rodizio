import { createModule } from '../core/create-module.js';
import { getLatestRound } from './get-latest-round.js';
import { postCloseRound } from './post-close-round.js';
import { postUpsertRoundItem } from './post-upsert-round-item.js';
import { patchUpdateRoundStatus } from './patch-update-round-status.js';
import { getRoundWithItems } from './get-round-with-items.js';

const routes = [
	getLatestRound,
	postCloseRound,
	postUpsertRoundItem,
	patchUpdateRoundStatus,
	getRoundWithItems,
];

export function roundModule() {
	return createModule({
		name: 'rounds',
		prefix: 'v1/rounds',
		tags: ['Rounds'],
	}).use(routes);
}
