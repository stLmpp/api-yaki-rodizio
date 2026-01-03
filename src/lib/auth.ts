import { createAuth } from './create-auth.js';

// Variable used by the better-auth cli to generate migrations
export const auth = await createAuth({
	redisPort: process.env.REDIS_PORT,
	redisPassword: process.env.REDIS_PASSWORD,
	connectionString: process.env.BETTER_AUTH_DATABASE_URL,
	redisHost: process.env.REDIS_HOST,
	redisUsername: process.env.REDIS_USERNAME,
});
