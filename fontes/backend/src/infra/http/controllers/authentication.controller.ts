import { NextFunction, Request, Response } from 'express';
import {
	RefreshTokenOutputDTO,
	RefreshTokenUseCase
} from '../../../useCases/authentication/refreshToken.useCase';
import { NotFoundError } from '../../../errors/client.error';
import { IidentityService } from '../../../domain/services/Iidentity.service';
import { EntraIdService } from '../../../domain/services/entraId.service';
import {
	SignInOutputDTO,
	SignInUseCase
} from '../../../useCases/authentication/signIn.useCase';
import { SendVerificationCodeToEmailUseCase } from '../../../useCases/authentication/sendVerificationCodeToEmail.useCase';
import { ValidateEmailVerificationCodeUseCase } from '../../../useCases/authentication/validateEmailVerificationCode.useCase';
import { EmailService } from '../../../domain/services/email.service';
import { ResetUserPasswordUseCase } from '../../../useCases/authentication/resetUserPassword.useCase';
import { SendPasswordResetLinkToEmailUseCase } from '../../../useCases/user/sendPasswordResetLinkToEmail.useCase';
import { InviteUserToApplicationUseCase } from '../../../useCases/user/inviteUserToApplication.useCase';
import { TokenGenerator } from '../../../utils/tokenGenerator';
import { RegisterUserUseCase } from '../../../useCases/user/registerUser.useCase';
import { CheckEmailExistUseCase } from '../../../useCases/authentication/checkEmailExist.useCase';
import { UnauthorizedError } from '../../../errors/client.error';
import { SignOutUseCase } from '../../../useCases/authentication/signOut.useCase';
import UserRepository from '../../../domain/repositories/user.repository';
import VerificationEmailRepository from '../../../domain/repositories/verificationEmail.repository';
import TenantRepository from '../../../domain/repositories/tenant.repository';
import { SingleSignOnUseCase } from '../../../useCases/authentication/singleSignOn.useCase';
import DatabaseCredentialRepository from '../../../domain/repositories/databaseCredential.repository';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';

export class AuthenticationController {
	async signUp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			console.log('AuthenticationController: signUp request received', {
				email: req.body?.email,
				hasInvitedTenantsToken: Boolean(req.body?.invitedTenantsToken)
			});
			if (req.tenantConnection == undefined) {
				console.error('AuthenticationController: tenantConnection missing');
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			//O Service será criado com base no tipo de banco de dados e o model usado
			const userRepository: UserRepository = new UserRepository(
				req.tenantConnection
			);
			const verificationEmailRepository: VerificationEmailRepository =
				new VerificationEmailRepository(req.tenantConnection);
			const azureADService: EntraIdService = new EntraIdService();
			const tokenGenerator: TokenGenerator = new TokenGenerator();
			const databaseCredentialRepository: DatabaseCredentialRepository =
				new DatabaseCredentialRepository(req.tenantConnection);

			const registerUserUseCase: RegisterUserUseCase = new RegisterUserUseCase(
				userRepository,
				verificationEmailRepository,
				azureADService,
				tokenGenerator,
				databaseCredentialRepository
			);

			const user = await registerUserUseCase.execute({
				email: req.body.email,
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				password: req.body.password,
				userName: req.body.userName,
				invitedTenantsToken: req.body.invitedTenantsToken
			});

			console.log('AuthenticationController: signUp succeeded', {
				userId: user.id,
				email: user.email
			});
			res.status(200).send(user);
		} catch (error) {
			console.error('AuthenticationController: signUp failed', error);
			next(error);
		}
	}

	async signIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const acceptedCookieDomains =
				process.env.ACCEPTED_COOKIE_DOMAINS == undefined
					? ''
					: process.env.ACCEPTED_COOKIE_DOMAINS;

			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const userRepository: UserRepository = new UserRepository(
				req.tenantConnection
			);
			const azureADService: EntraIdService = new EntraIdService();
			const signInUseCase: SignInUseCase = new SignInUseCase(
				azureADService,
				userRepository
			);
			const result: SignInOutputDTO = await signInUseCase.execute({
				email: req.body.email,
				password: req.body.password
			});

			//Token de acesso é enviado para o cookie
			res.cookie(
				'accessToken_' + result.user.id,
				'Bearer ' + result.tokens.accessToken,
				{
					httpOnly: true, // Previne acesso pelo JavaScript do lado do cliente
					secure: true, // garante que o cookie só seja enviado por HTTPS
					sameSite: 'none',
					// domain: acceptedCookieDomains,
					maxAge: 60 * 60 * 1000 // 1 hora (horas * minutos * segundos * milisegundos)
				}
			);

			res.cookie('refreshToken_' + result.user.id, result.tokens.refreshToken, {
				httpOnly: true, // Previne acesso pelo JavaScript do lado do cliente
				secure: true,
				sameSite: 'none',
				// domain: acceptedCookieDomains,
				maxAge: 24 * 60 * 60 * 1000 // 1 dia
			});

			//Envia dados do usuário e tokens
			return res.status(200).send(result);
		} catch (error) {
			next(error);
		}
	}

	async signOut(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			//Obter usuário da sessão atual
			const sessionUserId = req.headers['usersession'];

			if (
				sessionUserId == undefined ||
				sessionUserId == null ||
				isNaN(Number(sessionUserId))
			) {
				throw new UnauthorizedError('UNAUTHORIZED', {
					cause: 'usersession not defined or invalid.'
				});
			}

			//Obter o token de acesso
			let accessToken = req.cookies['accessToken_' + sessionUserId];

			if (accessToken == undefined) {
				throw new UnauthorizedError('UNAUTHORIZED', {
					cause: 'accessToken not defined or invalid.'
				});
			}

			accessToken = accessToken.split(' ')[1]; // Obtém o token após "Bearer"

			const refreshToken = req.cookies['refreshToken_' + sessionUserId];

			const azureADService: EntraIdService = new EntraIdService();
			const signoutUseCase: SignOutUseCase = new SignOutUseCase(azureADService);

			await signoutUseCase.execute({
				accessToken,
				refreshToken
			});

			res.clearCookie('accessToken_' + sessionUserId, {
				httpOnly: true,
				secure: true,
				sameSite: 'none'
			});

			res.clearCookie('refreshToken_' + sessionUserId, {
				httpOnly: true,
				secure: true,
				sameSite: 'none'
			});

			//Só será enviado dados do usuário
			return res.status(200).send({});
		} catch (error) {
			next(error);
		}
	}

	async refreshToken(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			//Obter os tokens
			const cookies = req.cookies;

			if (cookies == undefined) {
				throw new UnauthorizedError('UNAUTHORIZED', {
					cause: 'refreshToken not defined or invalid.'
				});
			}

			// console.log(cookies);

			const refreshTokens: Map<string, string> = new Map<string, string>();

			for (const [key, refreshToken] of Object.entries(cookies)) {
				if (key.startsWith('refreshToken_')) {
					// Extrai o texto após "_"
					const userSessionId = key.split('refreshToken_')[1];

					if (isNaN(Number(refreshToken)) == true) {
						refreshTokens.set(userSessionId, refreshToken as string);
					}
				}
			}

			// console.log("valores do map de refreshtokens: ", refreshTokens);

			const acceptedCookieDomains =
				process.env.ACCEPTED_COOKIE_DOMAINS == undefined
					? ''
					: process.env.ACCEPTED_COOKIE_DOMAINS;

			//Define o serviço de servidor de Identidade
			const identityService: IidentityService = new EntraIdService();

			const newAccessData: RefreshTokenOutputDTO[] = [];

			const refreshTokenUseCase: RefreshTokenUseCase = new RefreshTokenUseCase(
				identityService
			);

			for (const [userSessionId, refreshToken] of refreshTokens) {
				const refreshTokenResponse = await refreshTokenUseCase.execute({
					refreshToken: refreshToken
				});

				//Token de acesso é enviado
				res.cookie(
					'accessToken_' + userSessionId,
					'Bearer ' + refreshTokenResponse.tokens.accessToken,
					{
						httpOnly: true, // Previne acesso pelo JavaScript do lado do cliente
						secure: true,
						sameSite: 'none', // Essa opção em 'strict' Protege contra CSRF
						// path: '/',
						domain: acceptedCookieDomains,
						maxAge: 10 * 60 * 1000 // 10 minutos (dias * horas * minutos * segundos * milisegundos )
					}
				);

				res.cookie(
					'refreshToken_' + userSessionId,
					refreshTokenResponse.tokens.refreshToken,
					{
						httpOnly: true, // Previne acesso pelo JavaScript do lado do cliente
						secure: true,
						sameSite: 'none',
						domain: acceptedCookieDomains,
						maxAge: 24 * 60 * 60 * 1000 // 1 dia
					}
				);

				refreshTokenResponse.user.id = Number(userSessionId);

				newAccessData.push(refreshTokenResponse);
			}

			if (newAccessData.length == 0) {
				throw new UnauthorizedError('UNAUTHORIZED', {
					cause: 'Error to refresh token'
				});
			}

			return res
				.status(200)
				.send(newAccessData.map((_newAccessData) => _newAccessData.user));
		} catch (error) {
			next(error);
		}
	}

	async singleSignOn(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			//Obter os tokens
			const cookies = req.cookies;

			if (cookies == undefined) {
				throw new UnauthorizedError('UNAUTHORIZED', {
					cause: 'refreshToken not defined or invalid.'
				});
			}

			const refreshTokens: Map<string, string> = new Map<string, string>();

			for (const [key, refreshToken] of Object.entries(cookies)) {
				if (key.startsWith('refreshToken_')) {
					// Extrai o texto após "_"
					const userSessionId = key.split('refreshToken_')[1];

					if (isNaN(Number(refreshToken)) == true) {
						refreshTokens.set(userSessionId, refreshToken as string);
					}
				}
			}

			const acceptedCookieDomains =
				process.env.ACCEPTED_COOKIE_DOMAINS == undefined
					? ''
					: process.env.ACCEPTED_COOKIE_DOMAINS;

			//Define o serviço de servidor de Identidade
			const identityService: IidentityService = new EntraIdService();

			const newAccessData: RefreshTokenOutputDTO[] = [];

			const userRepository: UserRepository = new UserRepository(
				req.tenantConnection
			);
			const singleSignOnUseCase: SingleSignOnUseCase = new SingleSignOnUseCase(
				identityService,
				userRepository
			);

			for (const [userSessionId, refreshToken] of refreshTokens) {
				const refreshTokenResponse = await singleSignOnUseCase.execute({
					refreshToken: refreshToken
				});

				//Token de acesso é enviado
				res.cookie(
					'accessToken_' + userSessionId,
					'Bearer ' + refreshTokenResponse.tokens.accessToken,
					{
						httpOnly: true, // Previne acesso pelo JavaScript do lado do cliente
						secure: true,
						sameSite: 'none', // Essa opção em 'strict' Protege contra CSRF
						path: '/',
						domain: acceptedCookieDomains,
						maxAge: 10 * 60 * 1000 // 10 minutos (dias * horas * minutos * segundos * milisegundos )
					}
				);

				res.cookie(
					'refreshToken_' + userSessionId,
					refreshTokenResponse.tokens.refreshToken,
					{
						httpOnly: true, // Previne acesso pelo JavaScript do lado do cliente
						secure: true,
						sameSite: 'none',
						domain: acceptedCookieDomains,
						maxAge: 24 * 60 * 60 * 1000 // 1 dia
					}
				);

				refreshTokenResponse.user.id = Number(userSessionId);

				newAccessData.push(refreshTokenResponse);
			}

			if (newAccessData.length == 0) {
				throw new UnauthorizedError('UNAUTHORIZED', {
					cause: 'Error to refresh token'
				});
			}

			return res
				.status(200)
				.send(newAccessData.map((_newAccessData) => _newAccessData.user));
		} catch (error) {
			next(error);
		}
	}

	async sendVerificationEmailCodeToEmail(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const verificationEmailRepository: VerificationEmailRepository =
				new VerificationEmailRepository(req.tenantConnection);
			const azureADService: EntraIdService = new EntraIdService();
			const sendVerificationCodeUseCase: SendVerificationCodeToEmailUseCase =
				new SendVerificationCodeToEmailUseCase(
					verificationEmailRepository,
					azureADService
				);
			const result = await sendVerificationCodeUseCase.execute(req.body);

			return res.status(200).send(result);
		} catch (error) {
			next(error);
		}
	}

	async validateVerificationEmailCode(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const verificationEmailRepository: VerificationEmailRepository =
				new VerificationEmailRepository(req.tenantConnection);
			const validateEmailVerificationCodeUseCase: ValidateEmailVerificationCodeUseCase =
				new ValidateEmailVerificationCodeUseCase(verificationEmailRepository);
			const result = await validateEmailVerificationCodeUseCase.execute({
				verificationEmailCode: String(req.body.verificationEmailCode)
			});

			return res.status(200).send(result);
		} catch (error) {
			next(error);
		}
	}

	async sendPasswordResetLinkToEmail(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			//Definir o servico de email que será usado
			const emailService: EmailService = new EmailService();
			const tokenGenerator: TokenGenerator = new TokenGenerator();
			const azureADService: EntraIdService = new EntraIdService();
			const sendPasswordResetLinkToEmailUseCase: SendPasswordResetLinkToEmailUseCase =
				new SendPasswordResetLinkToEmailUseCase(
					azureADService,
					emailService,
					tokenGenerator
				);
			const result = await sendPasswordResetLinkToEmailUseCase.execute({
				email: req.body.email
			});

			return res.status(200).send(result);
		} catch (error) {
			next(error);
		}
	}

	async resetPassword(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const azureADService: EntraIdService = new EntraIdService();
			const tokenGenerator: TokenGenerator = new TokenGenerator();
			const resetUserPasswordUseCase: ResetUserPasswordUseCase =
				new ResetUserPasswordUseCase(azureADService, tokenGenerator);
			const result = await resetUserPasswordUseCase.execute({
				password: req.body.password,
				resetPasswordToken: req.body.resetPasswordToken
			});

			return res.status(200).send(result);
		} catch (error) {
			next(error);
		}
	}

	async inviteUser(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}
			const userRepository: UserRepository = new UserRepository(
				req.tenantConnection
			);
			//Definir o servico de email que será usado
			const emailService: EmailService = new EmailService();
			//Serviço de geração de token
			const tokenGenerator = new TokenGenerator();
			const tenantRepository = new TenantRepository(req.tenantConnection);

			const inviteUserToApplicationUseCase: InviteUserToApplicationUseCase =
				new InviteUserToApplicationUseCase(
					emailService,
					userRepository,
					tokenGenerator,
					tenantRepository
				);

			const response = await inviteUserToApplicationUseCase.execute({
				invitedUserEmail: req.body.invitedUserEmail,
				invitedUserTenantIds: req.body.invitedUserTenantIds,
				invitingUserEmail: req.body.invitingUserEmail,
				invitingUserId: req.body.invitingUserId
			});

			return res.status(200).send(response);
		} catch (error) {
			next(error);
		}
	}

	async checkEmailExist(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			if (req.tenantConnection == undefined) {
				throw new NotFoundError('TENANT_NOT_FOUND');
			}

			const azureADService: EntraIdService = new EntraIdService();
			const checkEmailExistUseCase: CheckEmailExistUseCase =
				new CheckEmailExistUseCase(azureADService);
			const emailIsValid = await checkEmailExistUseCase.execute(req.body);

			return res.status(200).send(emailIsValid);
		} catch (error) {
			next(error);
		}
	}
}
