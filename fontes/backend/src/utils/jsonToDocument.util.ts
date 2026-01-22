import { Readable } from "stream";
import { CsvDataExporter } from "../infra/exporters/csvData.exporter";
import { XlsxDataExporter } from "../infra/exporters/xlsxData.exporter";
import { FieldMapping } from "../domain/services/registerDataFromCSV.service";

export function jsonToDocument(json: any[], documentType: 'csv' | 'xlsx'): Promise<Readable> {
    const mappings: FieldMapping[] = json[0]
  ? Object.keys(json[0] as object).map((key) => ({
      modelField: key,
      csvField: key
    }))
  : [];

  switch (documentType) {
    case 'csv':
      return jsonToCsv(json, mappings);
      break;
    case 'xlsx':
      return jsonToXlsx(json, mappings);
      break;
    default:
      return jsonToCsv(json, mappings);
      break;
  }
}



async function jsonToCsv(json: any[], mappings: FieldMapping[]): Promise<Readable> {
  const csvExporter = new CsvDataExporter();

  return await csvExporter.export(json, mappings);

}

async function jsonToXlsx(json: any[], mappings: FieldMapping[]): Promise<Readable> {
  const xlsxExporter = new XlsxDataExporter();

  return await xlsxExporter.export(json, mappings);
}
