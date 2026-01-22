import { Application, Router } from 'express';
import { ComponentStructureController } from '../controllers/componentStructure.controller';
import validateHeaders from '../validators/index.validator';
import { getPageStructureValidator } from '../validators/componentStructure.validators';
import { checkUserAccess } from '../middlewares/checkUserAccess.middleware';

/**
 * Irá definir as rotas da entidade
 * @param app Instância da aplicação express
 */
export default function defineRoute(app: Application) {
	const controller: ComponentStructureController =
		new ComponentStructureController();
	const router: Router = Router();

	router.post(
		'/',
		[checkUserAccess, ...getPageStructureValidator, validateHeaders],
		controller.findOne
	);

	app.use('/api/component-structure', router);
}