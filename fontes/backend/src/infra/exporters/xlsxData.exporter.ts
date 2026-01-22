import ExcelJS from 'exceljs';
import { FieldMapping } from '../../domain/services/registerDataFromCSV.service';
import { IDataExporter } from '../../domain/services/IdataExporter.service';
import { PassThrough, Readable } from 'stream';

export class XlsxDataExporter implements IDataExporter {
	async export(data: any[], fieldMappings: FieldMapping[]): Promise<Readable> {
		const workbook = new ExcelJS.Workbook();
		const sheet = workbook.addWorksheet('Dados');

		sheet.columns = fieldMappings.map((mapping) => ({
			header: mapping.csvField,
			key: mapping.modelField,
			width: 25
		}));

		data.forEach((entity) => {
			const row: any = {};
			fieldMappings.forEach((mapping) => {
				let value = (entity as any)[mapping.modelField];
				if (value instanceof Object && !(value instanceof Date) && value.id) {
					value = value.id;
				}
				if (value instanceof Array) {
					value = value.map((v) => v.id ?? v).join(', ');
				}
				row[mapping.modelField] =
					value !== null && value !== undefined && value !== 'null'
						? String(value)
						: '';
			});
			sheet.addRow(row);
		});

		const stream = new PassThrough();
		workbook.xlsx.write(stream).then(() => stream.end());
		return stream;
	}
}
