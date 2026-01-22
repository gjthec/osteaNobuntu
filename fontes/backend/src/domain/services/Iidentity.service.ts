import { RefreshTokenOutputDTO } from '../../useCases/authentication/refreshToken.useCase';
import { SignInOutputDTO } from '../../useCases/authentication/signIn.useCase';
import { IUser } from '../entities/user.model';

export interface IidentityService {
	getAccessToken(): Promise<string>;
	getUserGroups(userId: string): Promise<any>;
	refreshToken(refreshToken: string): Promise<RefreshTokenOutputDTO>;
	getUserByEmail(email: string): Promise<IUser>;
	createUser(user: IUser): Promise<IUser>;
	signIn(
		username: string,
		password: string,
		useExternalEmail: boolean
	): Promise<SignInOutputDTO>;
	signOut(accessToken: string, refreshToken: string | null): Promise<any>;
	updateUser(user: IUser): Promise<IUser>;
	resetUserPassword(userUID: string, newPassword: string): Promise<IUser>;
	deleteUser(userID: string): Promise<string>;
	getUserProfilePhoto(userID: string): any;
	updateUserProfilePhoto(
		accessToken: string,
		photoBlob: Blob
	): Promise<boolean>;
}