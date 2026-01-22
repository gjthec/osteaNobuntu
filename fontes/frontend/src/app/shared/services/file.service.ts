import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { IFieldFile, IFile } from '../models/file.model';
import { Observable } from 'rxjs';

/**
 * Serviço para manipulação de arquivos
 */
@Injectable({
  providedIn: 'root'
})
export class FileService {

  url = environment.backendUrl + '/api/field-file';

  constructor(private http: HttpClient) { }

  /**
   * Faz o upload de um arquivo para um FieldFile
   * @param fieldFile FieldFile
  */
  uploadFile(fieldFile: IFieldFile): Observable<string> {
    return this.http.post<string>(`${this.url}/upload`, fieldFile);
  }

  /**
   * Atualiza um FieldFile
   * @param fieldFile FieldFile
   */
  async updateFile(fieldFile: IFieldFile) {
    return this.http.put<IFieldFile>(`${this.url}/${fieldFile.id}`, fieldFile);
  }

  /**
   * Deleta um arquivo de um FieldFile
   * @param id ID do arquivo
   */
  async deleteFile(id: string) {
    return this.http.delete(`${this.url}/${id}`);
  }

  /**
   * Faz o download de um arquivo de um FieldFile
   * @param fieldFile FieldFile
   * @param fileIndex Index do arquivo no FieldFile
   */
  downloadFile(file: IFile) {
    const blob = new Blob([file.dataBlob], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Faz o download de todos os arquivos de um FieldFile
   * @param fieldFile FieldFile
   */
  downloadAllFiles(fieldFile: IFieldFile) {
    fieldFile.files.forEach((file) => {
      this.downloadFile(file);
    });
  }

  /**
   * Faz o download sem precisar da classe em si, apenas com seu ID
   * @param fieldFileId ID do FieldFile
   */
  downloadFilesFromId(fieldFileId: string) {
    this.http.get<IFieldFile>(`${this.url}/${fieldFileId}`).subscribe(fieldFile => {
      this.downloadAllFiles(fieldFile);
    });
  } 

  /**
   * Converte um arquivo para base64
   * @param file Arquivo
   */
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  getFileWithEagerLoading(id: string): Observable<IFieldFile> {
    return this.http.get<IFieldFile>(`${this.url}/eagerLoading/${id}`);
  }
}
