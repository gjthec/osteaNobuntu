import { Response, NextFunction } from 'express';
import { GetSecurityTenantConnectionUseCase } from '../../../useCases/tenant/getSecurityTenantConnection.useCase';
import { AuthenticatedRequest } from './checkUserAccess.middleware';

export async function getSecurityTenant(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) {
	try {
		const getSecurityTenantConnectionUseCase: GetSecurityTenantConnectionUseCase =
			new GetSecurityTenantConnectionUseCase();

		req.tenantConnection = await getSecurityTenantConnectionUseCase.execute();

		next();
	} catch (error) {
		return res.status(500).json({
			message: 'Erro ao obter o tenant',
			details:
				error || 'Identificador de tenant a ser usado na operação não é válido'
		});
	}
}
