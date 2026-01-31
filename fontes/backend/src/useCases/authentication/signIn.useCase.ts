import { IidentityService } from '../../domain/services/Iidentity.service';
import {
	TooManyRequestsError,
	ValidationError,
	NotFoundError
} from '../../errors/client.error';
import { SyncUserAccountOnTenantsUseCase } from './syncUserAccountOnTenants.useCase';
import { IUser, User } from '../../domain/entities/user.model';
import { IUserAccessData } from '../../domain/entities/userAcessData.model';
import UserRepository from '../../domain/repositories/user.repository';
import { checkEmailIsValid } from '../../utils/verifiers.util';
import { loginAttempts } from '../../infra/http/middlewares/signInRateLimiter.middleware';
import { InternalServerError } from '../../errors/internal.error';

export type SignInInputDTO = {
	email: string;
	password: string;
};

export type SignInOutputDTO = {
	user: IUser;
	tokens: IUserAccessData;
};

export class SignInUseCase {
	constructor(
		private identityService: IidentityService,
		private userRepository: UserRepository
	) {}

	async execute(input: SignInInputDTO): Promise<SignInOutputDTO> {
		if (checkEmailIsValid(input.email) == false) {
			throw new Error('Incorrect email format.');
		}

		let accessData;

		try {
			accessData = await this.identityService.signIn(
				input.email,
				input.password,
				true
			);
		} catch (error: any) {
			if (error instanceof ValidationError) {
				const user = loginAttempts[input.email];

				if (user != undefined) {
					user.attempts += 1;

					if (user.attempts >= 5) {
						user.blockUntil = Date.now() + 15 * 60 * 1000; // Bloqueia por 15 minutos
						throw new TooManyRequestsError('TOO_MANY_REQUEST', {
							cause: 'Too many signIn attempts. Please try accessing later.'
						});
					}
				}

				throw error;
			} else {
				throw new InternalServerError('Error to signin. .', { cause: error });
			}
		}

		accessData.user.email = input.email;

		const tenantUID = process.env.TENANT_ID;

		if (tenantUID == undefined) {
			throw new Error('TENANT_ID environment variables not populed');
		}

		let user = await this.userRepository.findOne({
			identityProviderUID: accessData.user.identityProviderUID
		});

		try {
			if (user == null) {
				let graphUser: IUser | null = null;

				try {
					graphUser = await this.identityService.getUserByEmail(input.email);
				} catch (error) {
					if (!(error instanceof NotFoundError)) {
						console.error('Error to load user data from Graph API:', error);
					}
				}

				const resolvedUser = {
					identityProviderUID: accessData.user.identityProviderUID,
					userName: graphUser?.userName || accessData.user.userName,
					firstName: graphUser?.firstName || accessData.user.firstName,
					lastName: graphUser?.lastName || accessData.user.lastName,
					email: graphUser?.email || accessData.user.email,
					tenantUID: tenantUID
				};

				accessData.user.userName = resolvedUser.userName;
				accessData.user.firstName = resolvedUser.firstName;
				accessData.user.lastName = resolvedUser.lastName;
				accessData.user.email = resolvedUser.email;
				accessData.user.tenantUID = resolvedUser.tenantUID;

				user = await this.userRepository.create(
					new User({
						identityProviderUID: resolvedUser.identityProviderUID, //UID do servidor de identidade
						userName: resolvedUser.userName,
						firstName: resolvedUser.firstName,
						lastName: resolvedUser.lastName,
						isAdministrator: true,
						email: resolvedUser.email,
						tenantUID: resolvedUser.tenantUID
					})
				);
			} else {
				await this.userRepository.update(user.id!, {
					UID: accessData.user.identityProviderUID, //UID do servidor de identidade
					userName: accessData.user.userName,
					firstName: accessData.user.firstName,
					lastName: accessData.user.lastName,
					isAdministrator: true,
					email: accessData.user.email,
					tenantUID: tenantUID
				});
			}
		} catch (error) {
			console.error('Signin error. Error to save user on database.', error);
			throw new ValidationError('VALITADION', {
				cause: 'Signin error. Error to save user on database.'
			});
		}

		try {
			const syncUserAccountOnTenantsUseCase: SyncUserAccountOnTenantsUseCase =
				new SyncUserAccountOnTenantsUseCase();
			const value = await syncUserAccountOnTenantsUseCase.execute(
				accessData.user.identityProviderUID!,
				accessData.user
			);
		} catch (error) {
			throw new InternalServerError(
				'Signin error. Error to sync user with aplication tenants. .',
				{ cause: error }
			);
		}

		accessData.user.id = user.id;
		//TODO verificar se o usuário está presente no grupo que dá permissão a aplicação para permitir ou não ele de realizar o acesso

		return accessData;
	}
}
