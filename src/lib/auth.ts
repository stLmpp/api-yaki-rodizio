import { createAuth } from './create-auth.js';

// Variable used by the better-auth cli to generate migrations
export const auth = createAuth({
	connectionString: process.env.BETTER_AUTH_DATABASE_URL,
	redisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
	redisUrl: process.env.UPSTASH_REDIS_REST_URL,
});
