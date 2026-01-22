import { IEmailAdapter } from '../../adapters/iemail.adapter';
import { NodemailerAdapter } from '../../adapters/nodeMailer.adapter';
import { InternalServerError } from '../../errors/internal.error';
import { IEmailService } from './Iemail.service';

export interface IEmailParams {
	from?: string; // O "from" é opcional
	to: string;
	subject: string;
	text: string;
}

export class EmailService implements IEmailService {
	private emailAdapter: IEmailAdapter;
	private emailUser: string;

	constructor() {
		const emailServerHost: string | undefined = process.env.EMAIL_SERVER_HOST;
		const emailServerPort: string | undefined = process.env.EMAIL_SERVER_PORT;
		const emailServerUser: string | undefined = process.env.EMAIL_SERVER_USER;
		const emailServerPassword: string | undefined =
			process.env.EMAIL_SERVER_PASSWORD;
		const emailUser: string | undefined = process.env.EMAIL_USER;

		if (
			emailServerHost == undefined ||
			emailServerPort == undefined ||
			emailServerUser == undefined ||
			emailServerPassword == undefined
		) {
			throw new InternalServerError('NOT_FOUND', {
				cause:
					'Não foi encontrado as credenciais para acessar o servidor de email.'
			});
		}

		if (emailUser == undefined) {
			throw new InternalServerError('NOT_FOUND', {
				cause:
					'Não foi definido email que irá ser quem mandará a mensagem para o usuário'
			});
		}

		this.emailUser = emailUser;

		const port = parseInt(emailServerPort); //TODO pode dar erro.

		//Caso queira mudar o pacote que é usado para envio de emails, mudar a classe abaixo
		this.emailAdapter = new NodemailerAdapter({
			emailServerPassword: emailServerPassword,
			emailServerUser: emailServerUser,
			host: emailServerHost,
			port: port,
			user: emailUser
		});
	}

	/**
	 * Faz o envio de email usando o email padrão de envio como remetente (quem nada a mensagem)
	 * @returns
	 */
	async sendEmailWithDefaultEmail({
		to,
		subject,
		text
	}: Omit<IEmailParams, 'from'>) {
		return await this.emailAdapter.sendMail(this.emailUser, to, subject, text);
	}

	async sendEmail({ from, to, subject, text }: IEmailParams) {
		return await this.emailAdapter.sendMail(from!, to, subject, text);
	}
}
