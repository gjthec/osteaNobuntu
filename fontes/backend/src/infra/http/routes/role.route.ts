import { Application, Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import validateHeaders from '../validators/index.validator';
import {
	createNewRoleValidator,
	findAllRoleValidator
} from '../validators/role.validator';
import { checkUserAccess } from '../middlewares/checkUserAccess.middleware';
import { requireRole } from '../middlewares/session.middleware';
/**
 * Irá definir as rotas da entidade
 * @param app Instância da aplicação express
 */
export default function defineRoute(app: Application) {
	const controller: RoleController = new RoleController();
	const router: Router = Router();

	//Create a new
	router.post(
		'/',
		[checkUserAccess, requireRole('ADMIN'), ...createNewRoleValidator, validateHeaders],
		controller.create
	);
	//Find all by user
	router.get('/user', [checkUserAccess], controller.findAllByUser);
	//Find all
	router.get(
		'/',
		[...findAllRoleValidator, validateHeaders],
		controller.findAll
	);
	//Find count
	router.get('/count', [checkUserAccess], controller.getCount);
	//Find by id
	router.get('/:id', controller.findById);
	//Update
	router.put('/:id', [checkUserAccess, requireRole('ADMIN')], controller.update);
	//Delete all
	router.delete('/all', [checkUserAccess, requireRole('ADMIN')], controller.deleteAll);
	//Delete
	router.delete('/:id', [checkUserAccess, requireRole('ADMIN')], controller.delete);

	app.use('/api/role', router);
}
