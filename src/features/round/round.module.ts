import { createModule } from '../core/create-module.js';
import { getLatestRoundController } from './get-latest-round.controller.js';
import { postCloseRoundController } from './post-close-round.controller.js';

export function roundModule() {
	return createModule({
		name: 'rounds',
		prefix: 'v1/rounds',
	})
		.use(getLatestRoundController)
		.use(postCloseRoundController);
}
