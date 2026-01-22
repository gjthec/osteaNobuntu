import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { IPageStructure } from 'app/shared/models/pageStructure';

export interface ImportCsvDialogData {
   className: string;
   jsonConfig: IPageStructure;
}

export interface ImportCsvResult {
  data: any[];
  settings: {
    delimiter: string;
    encoding: string;
    hasHeader: boolean;
    skipEmptyLines: boolean;
    skipEmptyColumns: boolean;
  };
}

@Component({
  selector: 'app-import-csv',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './import-csv.component.html',
  styleUrl: './import-csv.component.scss'
})
export class ImportCsvComponent implements OnInit {
  importForm!: FormGroup;
  selectedFile: File | null = null;
  isDragOver = false;
  isProcessing = false;
  errorMessage = '';
  previewData: any[][] = [];
  colsToImport: boolean[] = [];
  displayedColumns: string[] = [];
  columnTypes: string[] = []; // Tipos das colunas para exibição
  totalRows = 0;
  classAttributesNames: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ImportCsvComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportCsvDialogData
  ) {}

  ngOnInit(): void {
    this.getClassAttributes();
    this.initializeForm();
  }

  private getClassAttributes(): void {
    const attributes = this.data.jsonConfig.attributes || [];
    for(const attr of attributes) {
      this.classAttributesNames.push(attr.foreignKeyName || attr.name);
    }
  }

  /**
   * Converte o valor baseado no tipo de campo definido no JSON de configuração
   */
  private convertValueByType(fieldName: string, value: string): any {
    if (!value || value.trim() === '') {
      return null;
    }

    const attribute = this.data.jsonConfig.attributes?.find(
      attr => (attr.foreignKeyName || attr.name) === fieldName
    );

    if (!attribute) {
      return value; // Retorna como string se não encontrar o atributo
    }

    try {
      switch (attribute.type?.toLowerCase()) {
        case 'boolean':
        case 'bool':
          return this.convertToBoolean(value);
        
        case 'number':
        case 'int':
        case 'integer':
        case 'float':
        case 'double':
          return this.convertToNumber(value);
        
        case 'date':
        case 'datetime':
          return this.convertToDate(value);
        
        default:
          return value; // Mantém como string para tipos não reconhecidos
      }
    } catch (error) {
      console.warn(`Erro ao converter valor "${value}" para o tipo "${attribute.type}" no campo "${fieldName}":`, error);
      return value; // Retorna o valor original em caso de erro
    }
  }

  /**
   * Converte string para boolean
   */
  private convertToBoolean(value: string): boolean {
    if (!value) return false;
    
    const trimmedValue = value.trim().toLowerCase();
    
    // Valores considerados true
    const trueValues = ['true', '1', 'yes', 'sim', 'y', 's', 'on', 'ativo', 'active', 'verdadeiro', 'v'];
    // Valores considerados false
    const falseValues = ['false', '0', 'no', 'não', 'nao', 'n', 'off', 'inativo', 'inactive', 'falso', 'f'];
    
    if (trueValues.includes(trimmedValue)) {
      return true;
    }
    
    if (falseValues.includes(trimmedValue)) {
      return false;
    }
    
    // Se não reconhecer o valor, tenta converter numericamente
    const numericValue = parseFloat(trimmedValue);
    if (!isNaN(numericValue)) {
      return numericValue !== 0;
    }
    
    // Caso padrão: considera false se não conseguir determinar
    console.warn(`Valor boolean não reconhecido: "${value}". Assumindo false.`);
    return false;
  }

  /**
   * Converte string para number
   */
  private convertToNumber(value: string): number | null {
    const trimmedValue = value.trim();
    
    // Remove caracteres de formatação comum (vírgulas como separador de milhares)
    const cleanedValue = trimmedValue.replace(/[,\s]/g, '');
    
    // Tenta converter vírgula decimal para ponto
    const normalizedValue = cleanedValue.replace(/,(\d+)$/, '.$1');
    
    const numericValue = parseFloat(normalizedValue);
    
    return isNaN(numericValue) ? null : numericValue;
  }

  /**
   * Converte string para date (retorna como string ISO ou Date)
   */
  private convertToDate(value: string): string | null {
    const trimmedValue = value.trim();
    
    try {
      // Tenta diferentes formatos de data
      const formats = [
        // ISO format
        /^\d{4}-\d{2}-\d{2}$/,
        // Brazilian format
        /^\d{2}\/\d{2}\/\d{4}$/,
        // American format
        /^\d{2}-\d{2}-\d{4}$/,
      ];
      
      // Se já está em formato ISO, retorna como está
      if (formats[0].test(trimmedValue)) {
        return trimmedValue;
      }
      
      // Converte formato brasileiro (dd/mm/yyyy) para ISO
      if (formats[1].test(trimmedValue)) {
        const [day, month, year] = trimmedValue.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Converte formato americano (mm-dd-yyyy) para ISO
      if (formats[2].test(trimmedValue)) {
        const [month, day, year] = trimmedValue.split('-');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Tenta usar Date.parse como último recurso
      const date = new Date(trimmedValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // Retorna apenas a parte da data
      }
      
      return null;
    } catch (error) {
      console.warn(`Erro ao converter data: ${trimmedValue}`, error);
      return null;
    }
  }

  private initializeForm(): void {
    this.importForm = this.fb.group({
      delimiter: [',', Validators.required],
      encoding: ['UTF-8', Validators.required],
      hasHeader: [true],
      skipEmptyLines: [true],
      skipEmptyColumns: [true]
    });

    // Subscribe to form changes to update preview
    this.importForm.valueChanges.subscribe(() => {
      if (this.selectedFile) {
        this.processFile();
      }
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.errorMessage = '';
    
    // Validate file type
    if (!this.isValidFileType(file)) {
      this.errorMessage = 'Tipo de arquivo inválido. Apenas arquivos CSV são aceitos.';
      return;
    }

    this.selectedFile = file;
    this.processFile();
  }

  private isValidFileType(file: File): boolean {
    const allowedExtensions = ['.csv'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(fileExtension) || file.type === 'text/csv';
  }

  private processFile(): void {
    if (!this.selectedFile) return;

    this.isProcessing = true;
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        this.parseCSVContent(content);
      } catch (error) {
        this.errorMessage = 'Erro ao processar o arquivo. Verifique se é um CSV válido.';
        console.error('Error processing file:', error);
      } finally {
        this.isProcessing = false;
      }
    };

    reader.onerror = () => {
      this.errorMessage = 'Erro ao ler o arquivo.';
      this.isProcessing = false;
    };

    // Read file with selected encoding
    const encoding = this.importForm.get('encoding')?.value || 'UTF-8';
    if (encoding === 'UTF-8') {
      reader.readAsText(this.selectedFile, 'UTF-8');
    } else {
      reader.readAsText(this.selectedFile, encoding);
    }
  }

  private parseCSVContent(content: string): void {
    this.importForm.get('delimiter')?.setValue(this.detectSeparator(content) || this.importForm.get('delimiter')?.value || ',', { emitEvent: false });
    this.importForm.get('encoding')?.setValue(this.detectEncoding(content) || this.importForm.get('encoding')?.value || 'UTF-8', { emitEvent: false });
    const delimiter = this.detectSeparator(content) || this.importForm.get('delimiter')?.value || ',';
    const hasHeader = this.importForm.get('hasHeader')?.value || false;
    const skipEmptyLines = this.importForm.get('skipEmptyLines')?.value || false;
    const skipEmptyColumns = this.importForm.get('skipEmptyColumns')?.value || false;

    let lines = content.split('\n');
    
    if (skipEmptyLines) {
      lines = lines.filter(line => line.trim().length > 0);
    }

    let columnsToKeep: boolean[] = [];
    
    if (skipEmptyColumns) {
      // First, parse all lines to identify empty columns
      const allRows = lines.map(line => this.parseCSVLine(line, delimiter));
      let headers: string[] = [];

      if (hasHeader && allRows.length > 0) {
        headers = allRows[0]; // First row is header
        allRows.shift(); // Remove header from data rows
      } 
      
      if (allRows.length > 0) {
        const columnCount = Math.max(...allRows.map(row => row.length));
        
        // Check each column to see if it has any non-empty values
        for (let colIndex = 0; colIndex < columnCount; colIndex++) {
          const hasContent = allRows.some(row => 
            row[colIndex] && row[colIndex].trim() !== ''
          );
          columnsToKeep[colIndex] = hasContent;
        }
        
        // Rebuild lines keeping only non-empty columns
        const filteredDataRows = allRows.map(row => {
          const filteredRow = row.filter((_, index) => columnsToKeep[index]);
          return filteredRow.join(delimiter);
        });
        
        // If has header, filter it too and add it back
        if (hasHeader && headers.length > 0) {
          const filteredHeaders = headers.filter((_, index) => columnsToKeep[index]);
          lines = [filteredHeaders.join(delimiter), ...filteredDataRows];
        } else {
          lines = filteredDataRows;
        }
      }
    }

    // Parse CSV lines
    const parsedData: any[][] = [];
    lines.forEach((line, index) => {
      if (line.trim()) {
        const row = this.parseCSVLine(line, delimiter);
        parsedData.push(row);
      }
    });

    const requiredValidator = this.validateForRequiredColumns(parsedData, hasHeader);

    if (!requiredValidator) {
      this.selectedFile = null;
      this.previewData = [];
      this.displayedColumns = [];
      this.columnTypes = [];
      this.totalRows = 0;
      this.isProcessing = false;
      return;
    }

    this.totalRows = parsedData.length;
    
    // Take first 10 rows for preview
    this.previewData = parsedData.slice(0, 10);
    
    // Generate column names and detect types
    if (this.previewData.length > 0) {
      const columnCount = Math.max(...this.previewData.map(row => row.length));
      this.displayedColumns = Array.from({ length: columnCount }, (_, i) => `col${i}`);
      this.colsToImport = Array(columnCount).fill(true); // Default all columns to import
      
      // Detect column types based on headers (if available)
      this.columnTypes = Array(columnCount).fill('string');
      if (hasHeader && this.previewData.length > 0) {
        this.previewData[0].forEach((header, index) => {
          const attribute = this.data.jsonConfig.attributes?.find(
            attr => (attr.foreignKeyName || attr.name) === header
          );
          this.columnTypes[index] = attribute?.type || 'string';
        });
      }
    }
  }

  private detectEncoding(content: string): string {
    // Simple heuristic to detect UTF-8 BOM
    if (content.charCodeAt(0) === 0xFEFF) {
      return 'UTF-8';
    } else if (content.charCodeAt(0) === 0xFFFE) {
      return 'UTF-16LE';
    } else if (content.charCodeAt(0) === 0xEFBBBF) {
      return 'UTF-8';
    }
    // Default to UTF-8 if no BOM detected
    return 'UTF-8';
  }

  private detectSeparator(content: string): string {
    const separators = [',', ';', '\t', '|'];
    const lines = content.split('\n').slice(0, 5);
    const separatorCounts: { [key: string]: number } = {};

    separators.forEach(sep => {
      separatorCounts[sep] = 0;
      lines.forEach(line => {
        separatorCounts[sep] += (line.split(sep).length - 1);
      });
    });
    let detectedSeparator = ',';
    let maxCount = 0;
    for (const sep of separators) {
      if (separatorCounts[sep] > maxCount) {
        maxCount = separatorCounts[sep];
        detectedSeparator = sep;
      }
    }
    return detectedSeparator;
  }

  /**
   * Valida para verificar se o csv enviado tem ao menos um campo obrigatório
   * baseado na configuração JSON da classe
   * @param data 
   * @param hasHeader 
   * @returns boolean
   */
  private validateForRequiredColumns(data: any[][], hasHeader: boolean): boolean {
    if (!hasHeader || data.length === 0) return true;
    const headers = data[0];

    const requiredAttributes = this.data.jsonConfig.attributes?.filter(attr => attr.isRequired) || [];
    const requiredAttributesLength = requiredAttributes.length;
    console.log('Atributos obrigatórios:', requiredAttributes);
    //Se nao houver atributos obrigatórios ver se tem ao menos um atributo que bate com o json
    if (requiredAttributesLength === 0) {
      const matchingColumns = headers.filter(header => 
        this.data.jsonConfig.attributes?.some(attr => (attr.foreignKeyName || attr.name) === header)
      );
      if (matchingColumns.length === 0) {
        this.errorMessage = 'Nenhuma coluna do CSV corresponde aos atributos da classe.';
        return false;
      }
      return true;
    }

    const missingRequiredColumns = requiredAttributes.filter(attr => {
      const columnName = attr.foreignKeyName || attr.name;
      return !headers.includes(columnName);
    });

    if (missingRequiredColumns.length >= requiredAttributesLength) {
      const missingNames = missingRequiredColumns.map(attr => attr.foreignKeyName || attr.name).join(', ');
      this.errorMessage = `Colunas obrigatórias ausentes no CSV: ${missingNames}`;
      return false;
    }

    return true;
  }

  private parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.previewData = [];
    this.displayedColumns = [];
    this.columnTypes = [];
    this.totalRows = 0;
    this.errorMessage = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadTemplate(): void {
    if (this.classAttributesNames.length > 0) {
      // Create CSV header with class attribute names
      const headers = this.classAttributesNames.join(',');
      
      // Create example row with empty values or placeholder text
      const exampleRow = this.classAttributesNames.map(attr => `exemplo_${attr}`).join(',');
      
      const csvContent = `${headers}\n${exampleRow}`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `template_${this.data.className}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } else {
      // Fallback to default template
      this.generateDefaultTemplate();
    }
  }

  toggleColuna(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.colsToImport[index] = !this.colsToImport[index];
  }

  /**
   * Retorna informação sobre o tipo da coluna para exibição
   */
  getColumnTypeInfo(index: number): string {
    if (this.columnTypes && this.columnTypes[index]) {
      const type = this.columnTypes[index];
      switch (type.toLowerCase()) {
        case 'boolean':
        case 'bool':
          return 'Booleano (true/false, 1/0, sim/não)';
        case 'number':
        case 'int':
        case 'integer':
          return 'Número inteiro';
        case 'float':
        case 'double':
          return 'Número decimal';
        case 'date':
          return 'Data (dd/mm/yyyy ou yyyy-mm-dd)';
        case 'datetime':
          return 'Data e hora';
        default:
          return 'Texto';
      }
    }
    return 'Texto';
  }

  /**
   * Retorna a classe CSS para o tipo da coluna
   */
  getColumnTypeClass(index: number): string {
    if (this.columnTypes && this.columnTypes[index]) {
      const type = this.columnTypes[index].toLowerCase();
      switch (type) {
        case 'boolean':
        case 'bool':
          return 'type-boolean';
        case 'number':
        case 'int':
        case 'integer':
        case 'float':
        case 'double':
          return 'type-number';
        case 'date':
        case 'datetime':
          return 'type-date';
        default:
          return 'type-string';
      }
    }
    return 'type-string';
  }

  /**
   * Retorna o ícone para o tipo da coluna
   */
  getTypeIcon(index: number): string {
    if (this.columnTypes && this.columnTypes[index]) {
      const type = this.columnTypes[index].toLowerCase();
      switch (type) {
        case 'boolean':
        case 'bool':
          return 'toggle_on';
        case 'number':
        case 'int':
        case 'integer':
        case 'float':
        case 'double':
          return 'pin';
        case 'date':
        case 'datetime':
          return 'event';
        default:
          return 'text_fields';
      }
    }
    return 'text_fields';
  }

  /**
   * Retorna o nome do tipo para exibição
   */
  getColumnTypeDisplay(index: number): string {
    if (this.columnTypes && this.columnTypes[index]) {
      const type = this.columnTypes[index].toLowerCase();
      switch (type) {
        case 'boolean':
        case 'bool':
          return 'Booleano';
        case 'number':
        case 'int':
        case 'integer':
          return 'Número';
        case 'float':
        case 'double':
          return 'Decimal';
        case 'date':
          return 'Data';
        case 'datetime':
          return 'Data/Hora';
        default:
          return 'Texto';
      }
    }
    return 'Texto';
  }

  /**
   * Valida se um valor pode ser convertido para o tipo especificado
   */
  private validateValueForType(value: string, type: string): boolean {
    if (!value || value.trim() === '') {
      return true; // Valores vazios são sempre válidos (null)
    }

    try {
      switch (type.toLowerCase()) {
        case 'boolean':
        case 'bool':
          return this.isValidBoolean(value);
        case 'number':
        case 'int':
        case 'integer':
        case 'float':
        case 'double':
          return this.isValidNumber(value);
        case 'date':
        case 'datetime':
          return this.isValidDate(value);
        default:
          return true; // Strings são sempre válidas
      }
    } catch {
      return false;
    }
  }

  /**
   * Verifica se o valor pode ser convertido para boolean
   */
  private isValidBoolean(value: string): boolean {
    const trimmedValue = value.trim().toLowerCase();
    const validValues = [
      'true', 'false', '1', '0', 'yes', 'no', 'sim', 'não', 'nao',
      'y', 'n', 's', 'on', 'off', 'ativo', 'inativo', 'active', 'inactive',
      'verdadeiro', 'falso', 'v', 'f'
    ];
    
    if (validValues.includes(trimmedValue)) {
      return true;
    }
    
    // Verifica se é um número válido
    const numericValue = parseFloat(trimmedValue);
    return !isNaN(numericValue);
  }

  /**
   * Verifica se o valor pode ser convertido para number
   */
  private isValidNumber(value: string): boolean {
    const trimmedValue = value.trim();
    const cleanedValue = trimmedValue.replace(/[,\s]/g, '');
    const normalizedValue = cleanedValue.replace(/,(\d+)$/, '.$1');
    const numericValue = parseFloat(normalizedValue);
    return !isNaN(numericValue);
  }

  /**
   * Verifica se o valor pode ser convertido para date
   */
  private isValidDate(value: string): boolean {
    const trimmedValue = value.trim();
    
    // Verifica formatos comuns
    const formats = [
      /^\d{4}-\d{2}-\d{2}$/,     // ISO format
      /^\d{2}\/\d{2}\/\d{4}$/,   // Brazilian format
      /^\d{2}-\d{2}-\d{4}$/,     // American format
    ];
    
    if (formats.some(format => format.test(trimmedValue))) {
      return true;
    }
    
    // Tenta usar Date.parse
    const date = new Date(trimmedValue);
    return !isNaN(date.getTime());
  }

  /**
   * Verifica se um valor é válido para uma coluna específica (usado no template)
   */
  isValidValueForColumn(value: string, columnIndex: number): boolean {
    if (!this.columnTypes || !this.columnTypes[columnIndex]) {
      return true; // Se não tem tipo definido, considera válido
    }
    
    return this.validateValueForType(value, this.columnTypes[columnIndex]);
  }

  /**
   * Retorna tooltip de validação para valores inválidos
   */
  getValidationTooltip(value: string, columnIndex: number): string {
    if (!this.columnTypes || !this.columnTypes[columnIndex]) {
      return '';
    }
    
    if (this.isValidValueForColumn(value, columnIndex)) {
      return '';
    }
    
    const type = this.getColumnTypeDisplay(columnIndex);
    return `Valor "${value}" pode não ser válido para o tipo ${type}. Será convertido da melhor forma possível.`;
  }

  private generateDefaultTemplate(): void {
    const csvContent = 'coluna1;coluna2;coluna3\nexemplo1;exemplo2;exemplo3';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onImport(): void {
    if (!this.selectedFile || this.importForm.invalid) {
      return;
    }

    this.isProcessing = true;

    // Process the full file for import
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const fullData = this.parseFullCSVContent(content);

        const result: ImportCsvResult = {
          data: fullData,
          settings: {
            delimiter: this.importForm.get('delimiter')?.value,
            encoding: this.importForm.get('encoding')?.value,
            hasHeader: this.importForm.get('hasHeader')?.value,
            skipEmptyLines: this.importForm.get('skipEmptyLines')?.value,
            skipEmptyColumns: this.importForm.get('skipEmptyColumns')?.value
          }
        };

        this.dialogRef.close(result);
      } catch (error) {
        this.errorMessage = 'Erro ao processar o arquivo para importação.';
        console.error('Error importing file:', error);
        this.isProcessing = false;
      }
    };

    reader.onerror = () => {
      this.errorMessage = 'Erro ao ler o arquivo para importação.';
      this.isProcessing = false;
    };

    const encoding = this.importForm.get('encoding')?.value || 'UTF-8';
    reader.readAsText(this.selectedFile, encoding);
  }

    private parseFullCSVContent(content: string): any[] {
    const delimiter = this.importForm.get('delimiter')?.value || ';';
    const hasHeader = this.importForm.get('hasHeader')?.value || false;
    const skipEmptyLines = this.importForm.get('skipEmptyLines')?.value || false;
    const skipEmptyColumns = this.importForm.get('skipEmptyColumns')?.value || false;

    let lines = content.split('\n');
    
    if (skipEmptyLines) {
      lines = lines.filter(line => line.trim().length > 0);
    }

    let columnsToKeep: boolean[] = [];
    
    if (skipEmptyColumns) {
      // First, parse all lines to identify empty columns
      const allRows = lines.map(line => this.parseCSVLine(line, delimiter));
      let headers: string[] = [];
      
      if (hasHeader && allRows.length > 0) {
        headers = allRows[0]; // First row is header
        allRows.shift(); // Remove header from data rows
      }
      
      if (allRows.length > 0) {
        const columnCount = Math.max(...allRows.map(row => row.length));
        
        // Check each column to see if it has any non-empty values
        for (let colIndex = 0; colIndex < columnCount; colIndex++) {
          const hasContent = allRows.some(row => 
            row[colIndex] && row[colIndex].trim() !== ''
          );
          columnsToKeep[colIndex] = hasContent;
        }
        
        // Rebuild lines keeping only non-empty columns
        const filteredDataRows = allRows.map(row => {
          const filteredRow = row.filter((_, index) => columnsToKeep[index]);
          return filteredRow.join(delimiter);
        });
        
        // If has header, filter it too and add it back
        if (hasHeader && headers.length > 0) {
          const filteredHeaders = headers.filter((_, index) => columnsToKeep[index]);
          lines = [filteredHeaders.join(delimiter), ...filteredDataRows];
        } else {
          lines = filteredDataRows;
        }
      }
    }

    // 1. Primeiro, parseie todas as linhas para um array de arrays
    const allParsedData: any[][] = lines
      .filter(line => line.trim())
      .map(line => this.parseCSVLine(line, delimiter));

    if (allParsedData.length === 0) {
      return [];
    }

    // 2. Agora, aplique o filtro das colunas
    if (hasHeader) {
      // Separa os cabeçalhos e os dados
      const originalHeaders = allParsedData[0];
      const dataRows = allParsedData.slice(1);

      // Filtra os cabeçalhos que serão usados como chaves do objeto
      const finalHeaders = originalHeaders.filter((_, index) => this.colsToImport[index]);
      
      // Mapeia as linhas de dados
      return dataRows.map(row => {
        // Filtra as células da linha atual
        const filteredRow = row.filter((_, index) => this.colsToImport[index]);
        
        const obj: any = {};
        // Monta o objeto usando os cabeçalhos e células já filtrados
        finalHeaders.forEach((header, index) => {
          const rawValue = filteredRow[index] || '';
          // Aplica conversão de tipo baseado na configuração JSON
          obj[header] = this.convertValueByType(header, rawValue);
        });
        return obj;
      });
    } else {
      // Se não tiver cabeçalho, apenas filtre cada linha
      return allParsedData.map(row => {
        return row.filter((_, index) => this.colsToImport[index]);
      });
    }
  }
}