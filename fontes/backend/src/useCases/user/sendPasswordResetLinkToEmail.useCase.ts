import { IUser } from '../../domain/entities/user.model';
import { EmailService } from '../../domain/services/email.service';
import { IidentityService } from '../../domain/services/Iidentity.service';
import { NotFoundError } from '../../errors/client.error';
import { InternalServerError } from '../../errors/internal.error';
import { ValidationError } from '../../errors/client.error';
import { TokenGenerator } from '../../utils/tokenGenerator';
import { checkEmailIsValid } from '../../utils/verifiers.util';

export type SendPasswordResetLinkToEmailInputDTO = {
	email: string;
};

export class SendPasswordResetLinkToEmailUseCase {
	constructor(
		private identityService: IidentityService,
		private emailService: EmailService,
		private tokenGenerator: TokenGenerator
	) {}

	async execute(input: SendPasswordResetLinkToEmailInputDTO): Promise<boolean> {
		if (checkEmailIsValid(input.email) == false) {
			throw new ValidationError('VALITADION', { cause: 'Email is invalid.' });
		}

		const applicationName = process.env.APPLICATION_NAME;
		const resetAccountPasswordPath = process.env.RESET_ACCOUNT_PASSWORD_PATH;
		const frontEndURL = process.env.FRONTEND_PATH;

		if (
			applicationName == undefined ||
			applicationName == '' ||
			resetAccountPasswordPath == undefined ||
			resetAccountPasswordPath == ''
		) {
			throw new Error(
				'Dados relacionados a envio de email de alteração de senha da conta não estão preechidos nas variáveis ambiente!'
			);
		}

		try {
			const user: IUser = await this.identityService.getUserByEmail(
				input.email
			);
		} catch (error) {
			throw new NotFoundError('USER_NOT_FOUND');
		}

		const resetPasswordToken: string = this.tokenGenerator.generateToken(
			{ email: input.email },
			300000
		);

		const resetPasswordURL =
			frontEndURL +
			resetAccountPasswordPath +
			'?emailVerificationCode=' +
			resetPasswordToken;
		try {
			await this.emailService.sendEmailWithDefaultEmail({
				subject:
					'Recuperação de email do serviço ' + process.env.APPLICATION_NAME,
				text:
					'Para alterar a senha da sua conta faça o acesso a esse link: ' +
					resetPasswordURL,
				to: input.email
			});

			return false;
		} catch (error) {
			throw new InternalServerError('Error to send email to user.', {
				cause: error
			});
		}
	}
}
