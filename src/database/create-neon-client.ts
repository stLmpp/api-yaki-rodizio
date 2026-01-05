import { neon, neonConfig } from '@neondatabase/serverless';

// TODO use environment variables
neonConfig.fetchEndpoint = 'http://localhost:5432/sql';
neonConfig.useSecureWebSocket = false;
neonConfig.poolQueryViaFetch = true;

export function createNeonClient(connectionString: string) {
	return neon(connectionString);
}
