import { RefreshTokenOutputDTO } from '../../useCases/authentication/refreshToken.useCase';
import { SignInOutputDTO } from '../../useCases/authentication/signIn.useCase';
import { AzureADService } from './azureAD.service';
import { IidentityService } from './Iidentity.service';
import { IUser } from '../entities/user.model';

export class EntraIdService implements IidentityService {
	private readonly azureService: AzureADService;

	constructor() {
		this.azureService = new AzureADService();
	}

	getAccessToken(): Promise<string> {
		return this.azureService.getAccessToken();
	}

	getUserGroups(userId: string): Promise<any> {
		return this.azureService.getUserGroups(userId);
	}

	refreshToken(refreshToken: string): Promise<RefreshTokenOutputDTO> {
		return this.azureService.refreshToken(refreshToken);
	}

	getUserByEmail(email: string): Promise<IUser> {
		return this.azureService.getUserByEmail(email);
	}

	createUser(user: IUser): Promise<IUser> {
		return this.azureService.createUser(user);
	}

	signIn(
		username: string,
		password: string,
		useExternalEmail: boolean
	): Promise<SignInOutputDTO> {
		return this.azureService.signIn(username, password, useExternalEmail);
	}

	signOut(accessToken: string, refreshToken: string | null): Promise<any> {
		return this.azureService.signOut(accessToken, refreshToken);
	}

	updateUser(user: IUser): Promise<IUser> {
		return this.azureService.updateUser(user);
	}

	resetUserPassword(userUID: string, newPassword: string): Promise<IUser> {
		return this.azureService.resetUserPassword(userUID, newPassword);
	}

	deleteUser(userID: string): Promise<string> {
		return this.azureService.deleteUser(userID);
	}

	getUserProfilePhoto(userID: string): any {
		return this.azureService.getUserProfilePhoto(userID);
	}

	updateUserProfilePhoto(accessToken: string, photoBlob: Blob): Promise<boolean> {
		return this.azureService.updateUserProfilePhoto(accessToken, photoBlob);
	}
}
