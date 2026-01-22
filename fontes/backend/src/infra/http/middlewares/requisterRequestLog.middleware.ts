import { Response, NextFunction } from 'express';
import { RequestLog, IRequestLogDataBaseModel } from '../../../domain/entities/requestLog.model';
import RequestLogRepository from '../../../domain/repositories/requestLog.repository';
import { AuthenticatedRequest } from './checkUserAccess.middleware';
import { InternalServerError } from '../../../errors/internal.error';
import { GetSecurityTenantConnectionUseCase } from '../../../useCases/tenant/getSecurityTenantConnection.useCase';

export async function registerRequestLog(
	request: AuthenticatedRequest,
	response: Response,
	next: NextFunction
) {
	const startTime = Date.now();

	// Captura o IP real (considerando proxies)
	const ip =
		(request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
		request.socket.remoteAddress ||
		'unknown';

	// Intercepta o método response.json para capturar a resposta
	const originalJson = response.json.bind(response);
	let responseBody: any;

	response.json = function (body: any) {
		responseBody = body;
		return originalJson(body);
	};

	const getSecurityTenantConnectionUseCase =
		new GetSecurityTenantConnectionUseCase();
	const securityTenant = await getSecurityTenantConnectionUseCase.execute();

	const requestLogRepository: RequestLogRepository = new RequestLogRepository(
		securityTenant
	);

  const userId = request.user?.id;
  const userIdentityProviderUID = request.user?.identityProviderUID;

  // Chamado quando finalizar a resposta a essa requisição.
	response.on('finish', async () => {
		const responseTime = Date.now() - startTime;

		//TODO usar RabbitMQ para direcionar isso para uma fila e realizar a operação de salvamento
		try {
			requestLogRepository.create({
			ip,
			route: request.originalUrl || request.url,
			method: request.method,
			statusCode: response.statusCode,
			responseTime,
			requestBody: request.body,
			responseBody: responseBody,
      userId: userId,
      userIdentityProviderUID: userIdentityProviderUID
		});
		} catch (error) {
			throw new InternalServerError("INTERNAL_SERVER_ERROR", {cause: error});
		}
	});

	next();
}
