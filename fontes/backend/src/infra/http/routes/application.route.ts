import { Application, Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';

/**
 * Irá definir as rotas da entidade
 * @param app Instância da aplicação express
 */
export default function defineRoute(app: Application) {
	const controller: ApplicationController = new ApplicationController();
	const router: Router = Router();

	//Find all
	router.get('/', controller.findAll);

	app.use('/api/application', router);
}