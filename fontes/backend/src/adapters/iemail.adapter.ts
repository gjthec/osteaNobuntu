export interface IEmailAdapter {
	sendMail(
		from: string,
		to: string,
		subject: string,
		text: string
	): Promise<void>;
}
