import { NextFunction, Response } from 'express';
import { RefreshTokenOutputDTO } from '../../../useCases/authentication/refreshToken.useCase';
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
import UserRepository from '../../../domain/repositories/user.repository';
import VerificationEmailRepository from '../../../domain/repositories/verificationEmail.repository';
import TenantRepository from '../../../domain/repositories/tenant.repository';
import { SingleSignOnUseCase } from '../../../useCases/authentication/singleSignOn.useCase';
import DatabaseCredentialRepository from '../../../domain/repositories/databaseCredential.repository';
import { AuthenticatedRequest } from '../middlewares/checkUserAccess.middleware';
import {
	buildSessionCookieOptions,
	getSessionCookieName,
	getSessionTtlSeconds,
	SessionService
} from '../session/session.service';

export class AuthenticationController {
	constructor() {
		this.signUp = this.signUp.bind(this);
		this.signIn = this.signIn.bind(this);
		this.signOut = this.signOut.bind(this);
		this.refreshToken = this.refreshToken.bind(this);
		this.singleSignOn = this.singleSignOn.bind(this);
		this.sendVerificationEmailCodeToEmail =
			this.sendVerificationEmailCodeToEmail.bind(this);
		this.validateVerificationEmailCode =
			this.validateVerificationEmailCode.bind(this);
		this.sendPasswordResetLinkToEmail =
			this.sendPasswordResetLinkToEmail.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
		this.inviteUser = this.inviteUser.bind(this);
		this.me = this.me.bind(this);
		this.checkEmailExist = this.checkEmailExist.bind(this);
	}

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
			console.log('AuthenticationController: signIn request received', {
				email: req.body?.email
			});
			if (req.tenantConnection == undefined) {
				console.error('AuthenticationController: tenantConnection missing');
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
			console.log('AuthenticationController: signIn succeeded', {
				userId: result.user.id,
				email: result.user.email
			});

			const roles = this.resolveUserRoles(result.user);
			const sessionService = SessionService.getInstance();
			const session = await sessionService.createSession(
				{
					id: result.user.id,
					identityProviderUID: result.user.identityProviderUID!,
					email: result.user.email,
					userName: result.user.userName,
					firstName: result.user.firstName,
					lastName: result.user.lastName,
					tenantUID: result.user.tenantUID,
					roles
				},
				result.tokens.accessToken
			);

			const maxAgeMs = getSessionTtlSeconds() * 1000;
			const cookieOptions = buildSessionCookieOptions(maxAgeMs);
			res.cookie(
				getSessionCookieName(),
				session.id,
				cookieOptions
			);
			console.log('AuthenticationController: session cookie set', {
				cookieName: getSessionCookieName(),
				secure: cookieOptions.secure,
				sameSite: cookieOptions.sameSite,
				maxAgeMs,
				hasOrigin: Boolean(req.headers.origin),
				origin: req.headers.origin
			});

			//Envia dados do usuário e roles
			return res.status(200).send({
				user: result.user,
				roles
			});
		} catch (error) {
			console.error('AuthenticationController: signIn failed', error);
			next(error);
		}
	}

	async signOut(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const sessionId = req.cookies?.[getSessionCookieName()];
			if (!sessionId) {
				throw new UnauthorizedError('UNAUTHORIZED', {
					cause: 'Session not found.'
				});
			}

			const sessionService = SessionService.getInstance();
			await sessionService.deleteSession(sessionId);

			res.clearCookie(getSessionCookieName(), buildSessionCookieOptions(0));
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
			throw new UnauthorizedError('UNAUTHORIZED', {
				cause: 'Token refresh disabled for session-based auth.'
			});
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

	async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			if (!req.session) {
				throw new UnauthorizedError('UNAUTHORIZED', {
					cause: 'Session not found.'
				});
			}

			return res.status(200).send({
				user: req.session.user,
				roles: req.session.user.roles
			});
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

	private resolveUserRoles(user: SignInOutputDTO['user']): string[] {
		const roles = new Set<string>(['USER']);
		const allowlist = (process.env.ADMIN_ALLOWLIST || '')
			.split(',')
			.map((value) => value.trim().toLowerCase())
			.filter((value) => value.length > 0);

		const email = user.email?.toLowerCase();
		if (user.isAdministrator || (email && allowlist.includes(email))) {
			roles.add('ADMIN');
		}

		return Array.from(roles);
	}
}
