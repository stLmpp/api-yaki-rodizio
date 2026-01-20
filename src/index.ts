import './config.js';
import Elysia from 'elysia';
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker';
import openapi from '@elysiajs/openapi';
import { authRoutes } from './features/core/auth.module.js';
import { roundModule } from './features/round/round.module.js';
import serverTiming from '@elysiajs/server-timing';
import { getAuthOpenApi } from './lib/auth-openapi.js';
import { productModule } from './features/product/product.module.js';
import { tableModule } from './features/table/table.module.js';
import { orderModule } from './features/order/order.module.js';
import cors from '@elysiajs/cors';

const documentation = await getAuthOpenApi();

const plugins = [
	cors({
		origin: '*', // TODO
	}),
	serverTiming(),
	openapi({
		provider: 'swagger-ui',
		path: '/openapi',
		documentation,
		swagger: {
			deepLinking: true,
			displayRequestDuration: true,
		},
	}),
];
const features = [
	authRoutes,
	roundModule(),
	productModule(),
	tableModule(),
	orderModule(),
];

export default new Elysia({
	adapter: CloudflareAdapter,
	prefix: '/api',
})
	.use(plugins)
	.use(features)
	.compile();

// TODO gravar horario de liberacao da proxima rodada na tabela round para que o front-end faca o calculo se a rodada esta liberada ou nao
