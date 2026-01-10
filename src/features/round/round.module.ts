import { createModule } from '../core/create-module.js';
import { getLatestRound } from './get-latest-round.js';
import { postCloseRound } from './post-close-round.js';
import { postUpsertRoundItem } from './post-upsert-round-item.js';
import { patchUpdateRoundStatus } from './patch-update-round-status.js';

export function roundModule() {
	return createModule({
		name: 'rounds',
		prefix: 'v1/rounds',
		tags: ['Rounds'],
	})
		.use(getLatestRound)
		.use(postCloseRound)
		.use(postUpsertRoundItem)
		.use(patchUpdateRoundStatus);
}
