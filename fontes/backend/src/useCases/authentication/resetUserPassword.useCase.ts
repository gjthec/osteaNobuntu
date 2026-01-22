import { IidentityService } from '../../domain/services/Iidentity.service';
import { TokenGenerator } from '../../utils/tokenGenerator';

interface JwtPayload {
	email: string;
}

export type ResetUserPasswordInputDTO = {
	password: string;
	resetPasswordToken: string;
};

/**
 * Caso de uso para mudança de senha do usuário
 */
export class ResetUserPasswordUseCase {
	constructor(
		private identityService: IidentityService,
		private tokenGenerator: TokenGenerator
	) {}

	async execute(input: ResetUserPasswordInputDTO): Promise<boolean> {
		try {
			//Validar JWT e pegar o payload (dados contidos dentro do JWT)
			const payload = this.tokenGenerator.verifyToken(
				input.resetPasswordToken
			) as JwtPayload;

			try {
				await this.identityService.resetUserPassword(
					payload.email,
					input.password
				);
			} catch (error) {
				throw error;
			}

			return true;
		} catch (error) {
			throw error;
		}
	}
}