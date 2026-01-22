import fs from 'fs';
import BaseRepository from '../repositories/base.repository';
import { parse } from 'csv-parse/sync';
import { InternalServerError } from '../../errors/internal.error';

// Interface genérica para mapeamento de campos
export interface FieldMapping {
	csvField: string;
	modelField: string;
	transform?: (value: string) => any;
}

type RegisterOptions = {
	/**
	 * Permite registrar dados com id definido
	 */
	allowExplicitIds?: boolean;
	afterInsertResyncSequence?: boolean;
	idColumnName?: string;
	schemaName?: string;
	tableName: string;
};

// Função genérica para registrar no banco ao inicializar aplicação qualquer entidade a partir de CSV
export async function registerDataFromCSV<T, U>(
	repository: BaseRepository<T, U>,
	csvFilePath: string,
	fieldMappings: FieldMapping[],
	entityFactory: (data: any) => T,
	options: RegisterOptions
): Promise<void> {
	const {
		allowExplicitIds = false,
		afterInsertResyncSequence = true,
		idColumnName = 'id',
		schemaName = 'public',
		tableName
	} = options;

	try {
		// Verifica se já existem registros no banco
		const count = await repository.getCount();

		// Se já existem registros e não estamos forçando atualização, não faz nada
		if (count > 0) {
			console.log(`Banco já possui ${count} registros. Pulando inicialização.`);
			return;
		}

		// Ler arquivo CSV
		const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

		// Parsear CSV
		const records = parse(fileContent, {
			columns: true,
			skip_empty_lines: true,
			trim: true
		});

		console.log(`Iniciando importação de ${records.length} registros...`);

		// Iniciar transação para garantir atomicidade
		const transaction = await repository.startTransaction();

		try {
			// Processar cada linha e inserir no banco
			for (const record of records) {
				const entityData: any = {};
				// Mapear campos do CSV para o modelo
				fieldMappings.forEach((mapping) => {
					const value = record[mapping.csvField];

					if (value !== undefined) {
						if (!allowExplicitIds && mapping.modelField === idColumnName) {
							// ignora ids vindos do CSV quando não permitido
							return;
						}

						entityData[mapping.modelField] = mapping.transform
							? mapping.transform(value)
							: value;
					}
				});

				// Criar entidade e salvar
				const entity = entityFactory(entityData);
				await repository.createWithTransaction(entity, transaction);
			}

			// Commit da transação
			await repository.commitTransaction(transaction);
			console.log(
				`Importação concluída com sucesso: ${records.length} registros inseridos.`
			);
		} catch (error) {
			console.log('Erro durante importação, fazendo rollback:', error);
			console.log(error);
			// Rollback em caso de erro
			if (transaction && !transaction.finished) {
				await repository.rollbackTransaction(transaction);
			}

			throw error;
		}
	} catch (error) {
		throw new InternalServerError('Error to register data from CSV.', {
			cause: error
		});
	}
}
