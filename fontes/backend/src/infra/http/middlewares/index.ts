import cors, { CorsOptions } from 'cors';
import { Application } from 'express';
import express from 'express';
import { errorHandler } from './errorHandler.middleware';
import { registerRequestLog } from './requisterRequestLog.middleware';
var cookieParser = require('cookie-parser');

export function setMiddlewaresBeforeRoutes(app: Application) {
	var corsOptions: CorsOptions = {
		origin: process.env.FRONTEND_PATH, // URL do frontend
		credentials: true, // Permite envio de cookies
		exposedHeaders: ['Content-Disposition']
	};

	//Limita o payload da requisição
	app.use(express.json({ limit: '50mb' }));
	app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  app.use(registerRequestLog);

	// Habilita o CORS
	app.use(cors(corsOptions));
	// parse requests of content-type - application/json
	app.use(express.json());
	// parse requests of content-type - application/x-www-form-urlencoded
	app.use(express.urlencoded({ extended: true }));

	app.use(cookieParser());
}

export function setMiddlewaresAfterRoutes(app: Application) {
	app.use(errorHandler); 
}