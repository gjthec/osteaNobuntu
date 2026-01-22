import { Request, Response, NextFunction, request } from 'express';
import { validationResult } from 'express-validator';
import { resolveLocale, translateError } from '../../../resources/i18n';
import { MessageCode } from '../../../resources/i18n/catalog';

/**
 * Fará a validação do dados do cabeçario da requisição. Caso for encontrado algum erro com base no validadores, será enviado o erro para o usuário.
 * @param req Dados da requisição
 * @param res Resposta da requisição
 * @param next
 * @returns
 */
export default function validateHeaders(
	request: Request,
	response: Response,
	next: NextFunction
) {
	// Obtem os erros de validação
	const _validationResult = validationResult(request);
	if (!_validationResult.isEmpty()) {
		const errors = _validationResult.array().map((error: any) => {
			if (typeof error.msg === 'object' && error.msg?.messageCode) {
				const { messageCode, metaData } = error.msg as {
					messageCode: string;
					metaData?: Record<string, any>;
				};

				const field = metaData?.field ?? error.path;
				return {
					// field: field,
					metaData: metaData,
					messageCode: messageCode,
					statusCode: 400
				};
			}
		});

		const locale = resolveLocale(request);

		let fieldErrorMessageList: string[] = [];

		errors.forEach((error) => {
			// const newFieldErrorMessage = translateError(locale, error!.messageCode as MessageCode, {field: error?.field});
			const newFieldErrorMessage = translateError(
				locale,
				error!.messageCode as MessageCode,
				error!.metaData
			);
			if (newFieldErrorMessage) {
				fieldErrorMessageList.push(newFieldErrorMessage);
			}
		});

		const message = fieldErrorMessageList.join(' ');

		const statusCode: number = 400;

		response.status(statusCode).json({
			status: 'error',
			statusCode,
			locale,
			message
		});

		return;
	}

	next();
}