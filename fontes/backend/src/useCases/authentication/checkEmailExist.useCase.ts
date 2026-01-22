import { IUser } from '../../domain/entities/user.model';
import { IidentityService } from '../../domain/services/Iidentity.service';
import { checkEmailIsValid } from '../../utils/verifiers.util';

export type CheckEmailExistInputDTO = {
	email: string;
};

export class CheckEmailExistUseCase {
	constructor(private identityService: IidentityService) {}

	async execute(input: CheckEmailExistInputDTO): Promise<boolean> {
		try {
			if (checkEmailIsValid(input.email) == false) {
				return false;
			}

			const user: IUser = await this.identityService.getUserByEmail(
				input.email
			);

			return true;
		} catch (error) {
			throw error;
		}
	}
}