import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../errors/app.error';
import { resolveLocale, translateError } from '../../../resources/i18n';
import { MessageCode } from '../../../resources/i18n/catalog';
import { printErrorChain } from '../../../utils/errorChain.util';

/**
 * Middleware que enviará para o usuário uma descrição do erro que ocorreu
 * @param error Dados do erro ocorrido
 */
export function errorHandler(
	error: AppError,
	request: Request,
	response: Response,
	nextFunction: NextFunction
) {
	const locale = resolveLocale(request);
	const statusCode: number = error.statusCode || 500;
	const message = translateError(locale, error.message as MessageCode);

  printErrorChain(error)

	response.status(statusCode).json({
		status: 'error',
		statusCode,
		locale,
		message
	});
}
