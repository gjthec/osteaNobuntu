import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import { TenantConnection } from '../entities/tenantConnection.model';
import {
	IVerificationEmailDatabaseModel,
	VerificationEmail
} from '../entities/verificationEmail.model';
import BaseRepository from './base.repository';

export default class VerificationEmailRepository extends BaseRepository<
	IVerificationEmailDatabaseModel,
	VerificationEmail
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<
			IVerificationEmailDatabaseModel,
			VerificationEmail
		> = createDbAdapter<IVerificationEmailDatabaseModel, VerificationEmail>(
			tenantConnection.models!.get('VerificationEmail'),
			tenantConnection.databaseType,
			tenantConnection.connection,
			VerificationEmail.fromJson
		);
		super(_adapter, tenantConnection);
	}

	async ifEmailWasValidated(email: string): Promise<boolean> {
		try {
			const validatedEmail: VerificationEmail | null =
				await this.adapter.findOne({ email: email });

			if (validatedEmail != null && validatedEmail.isVerified == true) {
				return true;
			}

			return false;
		} catch (error) {
			throw error;
		}
	}

	async checkIfExpired(email: string): Promise<boolean> {
		try {
			const emailVerification: VerificationEmail | null =
				await this.adapter.findOne({ email: email });

			if (emailVerification == null) {
				throw new Error(
					'Não existe código de verificação enviado para esse email'
				);
			}

			return emailVerification.isEmailExpired();
		} catch (error) {
			throw new Error(
				'Erro ao verificar se o código de verificação de email está valido'
			);
		}
	}
}