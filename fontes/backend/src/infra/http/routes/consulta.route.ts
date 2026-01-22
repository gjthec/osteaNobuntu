import { Application, Router } from 'express'; 
import { checkUserAccess } from '../middlewares/checkUserAccess.middleware'; 
import { ConsultaController } from '../controllers/consulta.controller'; 

export default function defineRoute(app: Application) { 
  const router: Router = Router(); 

  const consultaController: ConsultaController = new ConsultaController(); 

  app.use('/api/consulta', router);
};  
