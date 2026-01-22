import { Application, Router } from 'express';
import { checkUserAccess } from '../middlewares/checkUserAccess.middleware';
import validateHeaders from '../validators/index.validator';
import { PacienteController } from '../controllers/paciente.controller';
import { createNewPacienteValidator } from '../validators/paciente.validator';

export default function defineRoute(app: Application){ 
  const controller : PacienteController= new PacienteController(); 
  const router: Router = Router(); 
    // Create a new Paciente 
  router.post('/', [checkUserAccess, ...createNewPacienteValidator, validateHeaders] , controller.create);

    // Retrieve all pacientes 
  router.get('/', [checkUserAccess, validateHeaders], controller.findAll); 
    // Retrieve cout pacientes
  router.get('/count', [checkUserAccess], controller.getCount); 
    // Retrieve a single Paciente with id 
  router.get('/:id', [checkUserAccess], controller.findById); 
    // Update a Paciente with id 
  router.put('/:id', [checkUserAccess], controller.update); 
    // Delete a Paciente with id 
  router.delete('/:id', [checkUserAccess], controller.delete); 
    // Custom get Paciente 
    router.post("/custom", [checkUserAccess], controller.customQuery);

  // Retrieve a single Cliente with id with associations 
  router.get('/eagerloading/:id', [checkUserAccess], controller.findByIdWithEagerLoading);   
  // Retrieve many entities with eager loading 
  router.post('/eagerloading', [checkUserAccess], controller.findManyWithEagerLoading); 
    // Export Paciente 
    router.post("/exportDocument/:documentFormat", [checkUserAccess], controller.exportDocuments); 

    app.use('/api/pacientes', router); 
  }; 
