import { IVerificationEmail } from '../../domain/entities/verificationEmail.model';
import VerificationEmailRepository from '../../domain/repositories/verificationEmail.repository';
import {
	NotFoundError,
	UnauthorizedError,
	ValidationError
} from '../../errors/client.error';

export type ValidateEmailVerificationCodeInputDTO = {
	verificationEmailCode: string;
};

export class ValidateEmailVerificationCodeUseCase {
	constructor(
		private verificationEmailRepository: VerificationEmailRepository
	) {}

	async execute(
		input: ValidateEmailVerificationCodeInputDTO
	): Promise<boolean> {
		//Encontrar o código de email que foi enviado para o email do usuário
		const verificationEmailCodeExists: IVerificationEmail | null =
			await this.verificationEmailRepository.findOne({
				verificationCode: input.verificationEmailCode
			});

		if (verificationEmailCodeExists == null) {
			throw new NotFoundError('NOT_FOUND', {
				cause: 'Email verification code not found'
			});
		}

		if (!verificationEmailCodeExists.id) {
			throw new NotFoundError('NOT_FOUND', {
				cause: 'Email verification code ID not found'
			});
		}

		const currentTime: Date = new Date();

		if (
			currentTime.getTime() >
			verificationEmailCodeExists.expirationDate!.getTime()
		) {
			throw new ValidationError('VALITADION', {
				cause: 'The expiration time has already passed'
			});
		}

		if (verificationEmailCodeExists.isVerified == true) {
			return true;
		} else {
			verificationEmailCodeExists.isVerified = true;
			await this.verificationEmailRepository.update(
				verificationEmailCodeExists.id,
				verificationEmailCodeExists
			);
		}

		return true;
	}
}
