import { format } from 'fast-csv';
import { Readable } from 'stream';
import { IDataExporter } from '../../domain/services/IdataExporter.service';
import { FieldMapping } from '../../domain/services/registerDataFromCSV.service';

export class CsvDataExporter implements IDataExporter {
	async export(data: any[], mappings: FieldMapping[]): Promise<Readable> {
		// Criar os registros baseados nos mapeamentos
		const records = data.map((item) => {
			const record: Record<string, string> = {};
			mappings.forEach((mapping) => {
				let value = (item as any)[mapping.modelField];
				if (value instanceof Object && !(value instanceof Date) && value.id) {
					value = value.id;
				}
				if (value instanceof Array) {
					value = value.map((v) => v.id ?? v).join(', ');
				}
				record[mapping.csvField] =
					value !== null && value !== undefined && value !== 'null'
						? String(value)
						: '';
			});
			return record;
		});
		// Criar stream de dados e pipe com formato CSV
		const dataStream = Readable.from(records);
		const csvFormatter = format({ headers: true });

		return dataStream.pipe(csvFormatter);
	}
}
