import { Application, Router } from 'express';
import validateHeaders from '../validators/index.validator';
import { FieldFileController } from '../controllers/fieldFile.controller';
import { checkUserAccess } from '../middlewares/checkUserAccess.middleware';

export default function defineRoute(app: Application) {
	const controller: FieldFileController = new FieldFileController();
	const router: Router = Router();
	// Create a new FieldFile
	router.post('/', [checkUserAccess, validateHeaders], controller.create);

	// Retrieve all estrutura_orcamento
	router.get('/', [checkUserAccess, validateHeaders], controller.findAll);

	// Retrieve all fieldFile with files by id
	router.get('/files/:id', [checkUserAccess], controller.findAllFilesById);

	// Retrieve cout estrutura_orcamento
	router.get('/count', [checkUserAccess], controller.getCount);
	// Retrieve a single FieldFile with id with associations
	router.get(
		'/eagerLoading/:id',
		[checkUserAccess],
		controller.findByIdWithEagerLoading
	);
	// Retrieve a single FieldFile with id
	router.get('/:id', [checkUserAccess], controller.findById);
	// Update a FieldFile with id
	router.put('/:id', [checkUserAccess], controller.update);
	// Delete a FieldFile with id
	router.delete('/:id', [checkUserAccess], controller.delete);
	// Custom get FieldFile
	router.post('/custom', [checkUserAccess], controller.customQuery);
	// Upload a file
	router.post('/upload', [checkUserAccess], controller.upload);

	app.use('/api/field-file', router);
}