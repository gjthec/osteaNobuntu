import { IidentityService } from '../../domain/services/Iidentity.service';

export type SignOutInputDTO = {
	accessToken: string;
	refreshToken?: string;
};

export class SignOutUseCase {
	constructor(private identityService: IidentityService) {}

	async execute(input: SignOutInputDTO): Promise<boolean> {
		try {
			const response = await this.identityService.signOut(
				input.accessToken,
				input.refreshToken != undefined ? input.refreshToken : null
			);

			return true;
		} catch (error) {
			throw error;
		}
	}
}