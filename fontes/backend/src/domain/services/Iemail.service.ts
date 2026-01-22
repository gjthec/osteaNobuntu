import { IEmailParams } from './email.service';

export interface IEmailService {
	sendEmailWithDefaultEmail({
		to,
		subject,
		text
	}: Omit<IEmailParams, 'from'>): Promise<void>;
	sendEmail({ from, to, subject, text }: IEmailParams): Promise<void>;
}