import { Application, Router } from 'express';
import validateHeaders from '../validators/index.validator';
import { getSecurityTenant } from '../middlewares/tenant.middleware';
import {
	createNewFilterSearchParameterValidator,
	findAllFilterSearchParameterValidator
} from '../validators/filterSearchParameter.validator';
import { FilterSearchParameterController } from '../controllers/filterSearchParameter.controller';
import { checkUserAccess } from '../middlewares/checkUserAccess.middleware';

/**
 * Irá definir as rotas da entidade
 * @param app Instância da aplicação express
 */
export default function defineRoute(app: Application) {
	const controller: FilterSearchParameterController =
		new FilterSearchParameterController();
	const router: Router = Router();

	//TODO dar permissão de acesso a um outro usuário

	//TODO retirar permissão de acesso a um outro usuário

	//Create a new filter seatch parameter
	router.post(
		'/',
		[
			checkUserAccess,
			...createNewFilterSearchParameterValidator,
			validateHeaders
		],
		controller.create
	);
	//Remove a filter seatch parameter
	router.delete('/:id', [checkUserAccess], controller.delete);
	//Update filter seatch parameter
	router.put('/:id', [checkUserAccess], controller.update);
	//Find all
	router.get(
		'/',
		[
			checkUserAccess,
			...findAllFilterSearchParameterValidator,
			validateHeaders
		],
		controller.getAccessibleFilters
	);
	//Find by owner id
	// router.get('/mine', [checkUserAccess], controller.getByOwner);
	//Find one
	router.get('/:id', [checkUserAccess], controller.findById);

	app.use('/api/filter-search-parameters', router);
}
