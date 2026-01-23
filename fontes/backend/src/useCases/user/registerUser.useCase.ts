import { IidentityService } from '../../domain/services/Iidentity.service';
import { TokenGenerator } from '../../utils/tokenGenerator';
import { IUser, User } from '../../domain/entities/user.model';
import UserRepository from '../../domain/repositories/user.repository';
import VerificationEmailRepository from '../../domain/repositories/verificationEmail.repository';
import { checkEmailIsValid } from '../../utils/verifiers.util';
import { ValidationError } from '../../errors/client.error';
import { JwtPayload } from 'jsonwebtoken';
import DatabaseCredentialRepository from '../../domain/repositories/databaseCredential.repository';

export type signupInputDTO = {
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	invitedTenantsToken?: string;
};

export class RegisterUserUseCase {
	constructor(
		private userRepository: UserRepository,
		private verificationEmailRepository: VerificationEmailRepository,
		private identityService: IidentityService,
		private tokenGenerator: TokenGenerator,
		private databaseCredentialRepository: DatabaseCredentialRepository
	) {}

	async execute(input: signupInputDTO): Promise<IUser> {
		console.log('RegisterUserUseCase: start', {
			email: input.email,
			hasInvitedTenantsToken: Boolean(input.invitedTenantsToken)
		});
		if (checkEmailIsValid(input.email) == false) {
			throw new ValidationError('EMAIL_INVALID', { cause: 'Email is invalid.' });
		}

		let user: IUser | null = null;

		try {
			user = await this.identityService.getUserByEmail(input.email);
		} catch (error) {
			//
		}

		if (user != null) {
			throw new ValidationError('USER_ALREADY_EXISTS', {
				cause: 'User already exists.'
			});
		}

		//Verificar se dados do usuário são válidos novamente (verificar se o registro de confirmação de email foi validado)
		// TODO: Email verification is currently optional for signup.

		let registeredUserOnIdentityServer: IUser;

		try {
			registeredUserOnIdentityServer = await this.identityService.createUser({
				email: input.email,
				firstName: input.firstName,
				lastName: input.lastName,
				userName: input.userName,
				password: input.password
			});
			console.log('RegisterUserUseCase: identity user created', {
				identityProviderUID: registeredUserOnIdentityServer.identityProviderUID,
				email: registeredUserOnIdentityServer.email
			});
		} catch (error) {
			console.error('RegisterUserUseCase: createUser failed', error);
			throw error;
		}

		let userWillBeAdministrator: boolean = false;
		//Verificar se é o primeiro usuário da aplicação, para assim definir ele como admin
		if ((await this.userRepository.hasRegisteredUser()) == false) {
			userWillBeAdministrator = true;
		}

		const tenantUID = process.env.TENANT_ID;

		if (tenantUID == undefined) {
			throw new Error('TENANT_ID environment variables not populed');
		}

		let newUser: IUser | null = null;

		const provider = 'entraId';

		try {
			console.log('RegisterUserUseCase: creating database user', {
				email: input.email,
				tenantUID,
				provider
			});
			//Registra o usuário no banco de dados
			newUser = await this.userRepository.create(
				new User({
					identityProviderUID:
						registeredUserOnIdentityServer.identityProviderUID, //UID do servidor de identidade
					provider,
					userName: input.userName,
					firstName: input.firstName,
					lastName: input.lastName,
					isAdministrator: userWillBeAdministrator,
					email: input.email,
					tenantUID: tenantUID
				})
			);
			console.log('RegisterUserUseCase: database user created', {
				userId: newUser.id,
				email: newUser.email
			});
		} catch (error) {
			console.error('RegisterUserUseCase: database create failed', error);
			throw new Error('Error to create user. Details: ' + error);
		}

		if (input.invitedTenantsToken) {
			console.log('RegisterUserUseCase: invitedTenantsToken provided');
			//Validar JWT e pegar o payload (dados contidos dentro do JWT)
			const data = this.tokenGenerator.verifyToken(
				input.invitedTenantsToken
			) as JwtPayload;

			// const registerTenantPermissionUseCase: RegisterTenantPermissionUseCase = new RegisterTenantPermissionUseCase();
			// registerTenantPermissionUseCase.execute({
			//   databaseCredentialId: data.databaseCredentialId,
			//   tenantId: data.databaseCredentialId,
			//   userId: newUser.id!
			// });
			//TODO registrar acesso do usuário ao tenant
			// this.databaseCredentialRepository.advancedSearches.setUserPermissionForDatabaseCredential();
		}

		return newUser;
	}
}
