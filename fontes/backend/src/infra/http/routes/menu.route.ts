import { Application, Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { MenuController } from '../controllers/menu.controller';
import { checkUserAccess } from '../middlewares/checkUserAccess.middleware';


export default function defineRoute(app: Application) { 
  const router: Router = Router(); 

  const menuController: MenuController = new MenuController(); 

  router.get('/default-menu',[checkUserAccess], menuController.getDefaultMenu); 

  router.get('/menu-by-role',[checkUserAccess], menuController.getAllByRole);

  router.get('/:id', [checkUserAccess], menuController.getById);

  app.use('/api/menu', router);
};  
