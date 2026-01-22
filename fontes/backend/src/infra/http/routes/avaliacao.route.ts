import { Application, Router } from 'express';
import { checkUserAccess } from '../middlewares/checkUserAccess.middleware';
import validateHeaders from '../validators/index.validator';
import { AvaliacaoController } from '../controllers/avaliacao.controller';
import { createNewAvaliacaoValidator } from '../validators/avaliacao.validator';

export default function defineRoute(app: Application){ 
  const controller : AvaliacaoController= new AvaliacaoController(); 
  const router: Router = Router(); 
    // Create a new Avaliacao 
  router.post('/', [checkUserAccess, ...createNewAvaliacaoValidator, validateHeaders] , controller.create);

    // Retrieve all avaliacoes_coluna_lombar 
  router.get('/', [checkUserAccess, validateHeaders], controller.findAll); 
    // Retrieve cout avaliacoes_coluna_lombar
  router.get('/count', [checkUserAccess], controller.getCount); 
    // Retrieve a single Avaliacao with id 
  router.get('/:id', [checkUserAccess], controller.findById); 
    // Update a Avaliacao with id 
  router.put('/:id', [checkUserAccess], controller.update); 
    // Delete a Avaliacao with id 
  router.delete('/:id', [checkUserAccess], controller.delete); 
    // Custom get Avaliacao 
    router.post("/custom", [checkUserAccess], controller.customQuery);

  // Retrieve a single Cliente with id with associations 
  router.get('/eagerloading/:id', [checkUserAccess], controller.findByIdWithEagerLoading);   
  // Retrieve many entities with eager loading 
  router.post('/eagerloading', [checkUserAccess], controller.findManyWithEagerLoading); 
    // Export Avaliacao 
    router.post("/exportDocument/:documentFormat", [checkUserAccess], controller.exportDocuments); 

    app.use('/api/AvaliacoesColunaLombar', router); 
  }; 
