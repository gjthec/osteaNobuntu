import { FieldMapping } from './registerDataFromCSV.service';

export interface IDataExporter {
	export(data: any[], fieldMappings: FieldMapping[]): Promise<any>;
}
