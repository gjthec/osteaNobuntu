import { IUser } from '../../domain/entities/user.model';
import { IUserAccessData } from '../../domain/entities/userAcessData.model';
import { IidentityService } from '../../domain/services/Iidentity.service';

type RefreshTokenInputDTO = {
	refreshToken: string;
};

export type RefreshTokenOutputDTO = {
	user: IUser;
	tokens: IUserAccessData;
};

export class RefreshTokenUseCase {
	constructor(private identityService: IidentityService) {}

	async execute(input: RefreshTokenInputDTO): Promise<RefreshTokenOutputDTO> {
		return await this.identityService.refreshToken(input.refreshToken);
	}
}