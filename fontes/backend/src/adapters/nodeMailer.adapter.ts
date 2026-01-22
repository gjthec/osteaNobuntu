import nodemailer, { Transporter } from 'nodemailer';
import { IEmailAdapter } from './iemail.adapter';
import { BadGatewayError } from '../errors/internal.error';

interface IEmailServerData {
	host: string;
	port: number;
	user: string;
	emailServerUser: string;
	emailServerPassword: string;
}

/**
 * Implementação das funcionalidades de envio de e-mail com uso da biblioteca NodeMailer
 */
export class NodemailerAdapter implements IEmailAdapter {
	private transporter: Transporter;

	constructor(emailServerData: IEmailServerData) {
		this.transporter = this.createTransport(emailServerData);
	}

	createTransport(emailServerData: IEmailServerData): Transporter {
		try {
			return nodemailer.createTransport({
				host: emailServerData.host,
				port: emailServerData.port,
				secure: false,
				auth: {
					user: emailServerData.emailServerUser,
					pass: emailServerData.emailServerPassword
				}
			});
		} catch (error) {
			throw new BadGatewayError('Error to create Transporter to send Emails.', {
				cause: error
			});
		}
	}

	async sendMail(
		from: string,
		to: string,
		subject: string,
		text: string
	): Promise<void> {
		try {
			await this.transporter.sendMail({
				from: from,
				to,
				subject,
				text
			});
		} catch (error) {
			throw new BadGatewayError('Error to send Email.', { cause: error });
		}
	}
}