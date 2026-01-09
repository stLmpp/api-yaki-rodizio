import { createModule } from '../core/create-module.js';
import { getLatestRoundController } from './get-latest-round.controller.js';
import { postCloseRoundController } from './post-close-round.controller.js';
import { postUpsertRoundItemController } from './post-upsert-round-item.controller.js';
import { patchUpdateRoundStatusController } from './patch-update-round-status.controller.js';

export function roundModule() {
	return createModule({
		name: 'rounds',
		prefix: 'v1/rounds',
		tags: ['Rounds'],
	})
		.use(getLatestRoundController)
		.use(postCloseRoundController)
		.use(postUpsertRoundItemController)
		.use(patchUpdateRoundStatusController);
}
