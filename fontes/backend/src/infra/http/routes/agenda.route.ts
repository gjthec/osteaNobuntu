import { Application, Router } from 'express';
import { checkUserAccess } from '../middlewares/checkUserAccess.middleware';
import validateHeaders from '../validators/index.validator';
import { AgendaController } from '../controllers/agenda.controller';
import { createNewAgendaValidator } from '../validators/agenda.validator';

export default function defineRoute(app: Application){ 
  const controller : AgendaController= new AgendaController(); 
  const router: Router = Router(); 
    // Create a new Agenda 
  router.post('/', [checkUserAccess, ...createNewAgendaValidator, validateHeaders] , controller.create);

    // Retrieve all agenda 
  router.get('/', [checkUserAccess, validateHeaders], controller.findAll); 
    // Retrieve cout agenda
  router.get('/count', [checkUserAccess], controller.getCount); 
    // Retrieve a single Agenda with id 
  router.get('/:id', [checkUserAccess], controller.findById); 
    // Update a Agenda with id 
  router.put('/:id', [checkUserAccess], controller.update); 
    // Delete a Agenda with id 
  router.delete('/:id', [checkUserAccess], controller.delete); 
    // Custom get Agenda 
    router.post("/custom", [checkUserAccess], controller.customQuery);

  // Retrieve a single Cliente with id with associations 
  router.get('/eagerloading/:id', [checkUserAccess], controller.findByIdWithEagerLoading);   
  // Retrieve many entities with eager loading 
  router.post('/eagerloading', [checkUserAccess], controller.findManyWithEagerLoading); 
    // Export Agenda 
    router.post("/exportDocument/:documentFormat", [checkUserAccess], controller.exportDocuments); 

    app.use('/api/agenda', router); 
  }; 
