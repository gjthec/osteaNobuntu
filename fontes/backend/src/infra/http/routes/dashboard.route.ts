import { Application, Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { checkUserAccess } from '../middlewares/checkUserAccess.middleware';

export default function defineRoute(app: Application) { 
  const router: Router = Router(); 

  const dashboardController: DashboardController = new DashboardController(); 

  app.use('/api/dashboard', router);
};  
