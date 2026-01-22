import { BaseResourceModel } from './baseResource.model';

export interface IVerificationEmailDatabaseModel extends BaseResourceModel {
	email?: string;
	verificationCode?: string;
	isVerified?: boolean;
	verifiedDate?: Date;
	expirationDate?: Date;
}

export interface IVerificationEmail extends BaseResourceModel {
	email: string;
	verificationCode: string;
	isVerified: boolean;
	verifiedDate?: Date;
	expirationDate?: Date;
}

export class VerificationEmail extends BaseResourceModel {
	email: string;
	verificationCode: string;
	isVerified: boolean;
	verifiedDate?: Date;
	expirationDate?: Date;

	constructor(data: IVerificationEmail) {
		super();
		this.id = data.id;
		this.email = data.email;
		this.verificationCode = data.verificationCode;
		this.isVerified = data.isVerified;
		this.verifiedDate = data.verifiedDate;
		this.expirationDate = data.expirationDate;
		this.createdAt = data.createdAt;
	}

	static fromJson(jsonData: IVerificationEmail): VerificationEmail {
		return new VerificationEmail(jsonData);
	}

	isEmailExpired(): boolean {
		const currentDate = new Date();

		if (this.expirationDate == undefined) {
			return false;
		}

		if (currentDate > this.expirationDate) {
			return true;
		}

		return false;
	}
}