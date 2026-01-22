import { IidentityService } from '../../domain/services/Iidentity.service';

export type UpdateUserProfilePhotoInputDTO = {
	accessToken: string;
	photoBlob: Blob;
};

export class UpdateUserProfilePhotoUseCase {
	constructor(private identityService: IidentityService) {}

	async execute({
		accessToken,
		photoBlob
	}: UpdateUserProfilePhotoInputDTO): Promise<any> {
		return await this.identityService.updateUserProfilePhoto(
			accessToken,
			photoBlob
		);
	}
}