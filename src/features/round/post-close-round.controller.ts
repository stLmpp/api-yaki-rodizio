import { createModule } from '../core/create-module.js';
import { AuthRole } from '../../lib/create-auth.js';
import { type } from 'arktype';
import { bigintParamType } from '../../lib/types.js';

export const postCloseRoundController = createModule().post(
	'/:roundId/next',
	async ({ params, db }) => {},
	{
		auth: [AuthRole.Admin],
		params: type({ roundId: bigintParamType }),
	},
);
