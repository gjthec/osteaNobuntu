import express from 'express';
import { setRoutes } from './infra/http/routes';
import {
	setMiddlewaresAfterRoutes,
	setMiddlewaresBeforeRoutes
} from './infra/http/middlewares';
require('dotenv').config();

const app = express();

//Define os middlewares da applicação que operam antes de ir para as rotas
setMiddlewaresBeforeRoutes(app);

//Define as rotas da aplicação
setRoutes(app);

//Degine os middlewares da aplicação que operam após as rotas
setMiddlewaresAfterRoutes(app);

export default app;
