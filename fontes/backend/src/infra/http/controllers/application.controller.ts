import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { GetApplicationFromDirectoryUseCase } from '../../../useCases/application/getApplicationFromDirectory.useCase';
import { EntraIdService } from '../../../domain/services/entraId.service';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';

export class ApplicationController {
	async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const azureADService: EntraIdService = new EntraIdService();
			const getApplicationFromDirectoryUseCase: GetApplicationFromDirectoryUseCase =
				new GetApplicationFromDirectoryUseCase(azureADService);

			const applications = await getApplicationFromDirectoryUseCase.execute();

			return res.status(200).send(applications);
		} catch (error) {
			next(error);
		}
	}
}
