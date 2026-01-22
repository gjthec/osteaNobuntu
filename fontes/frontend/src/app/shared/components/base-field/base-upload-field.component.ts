import { Directive, Injector, OnDestroy } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { BaseFieldComponent } from './base-field.component';
import { FileService } from 'app/shared/services/file.service';
import { IFieldFile, IFile } from 'app/shared/models/file.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { iif, Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FileViwerComponent } from '../file-viwer/file-viwer.component';
import { MatDialog } from '@angular/material/dialog';

@Directive()
export abstract class BaseUpoadFieldComponent extends BaseFieldComponent implements OnDestroy {
  public translocoService: TranslocoService;
  private safeUrlList: SafeUrl[] = [];

  constructor(protected injector: Injector, protected fileService: FileService, protected matSnackBar: MatSnackBar, protected sanitizer: DomSanitizer, protected matDialog: MatDialog) {
    super(injector);
  }

  ngOnDestroy(): void {
    this.destroySafeUrl();
  }

  /**
   * Ponto de entrada para salvar arquivos.
   * Identifica se é um único arquivo ou múltiplo e delega para a função correta.
   * @param file Arquivo único ou array de arquivos nativos (File API).
   * @returns Promessa com a estrutura IFieldFile processada.
   */
  async saveFile(file: File | File[]): Promise<IFieldFile> {
    if (Array.isArray(file)) {
      return await this.filesToFieldFiles(file);
    } else {
      return await this.fileToFieldFile(file);
    }
  }
  
  /**
   * Converte um único arquivo nativo (File) para a estrutura interna IFieldFile.
   * Realiza a leitura e conversão para Base64.
   * @param file Objeto File nativo.
   * @returns Objeto IFieldFile preenchido.
   */
  async fileToFieldFile(file: File): Promise<IFieldFile> {
    const base64 = await this.fileToBase64(file);
    const fieldFile: IFieldFile = {
      fieldType: 'file',
      files: [{
        name: file.name,
        size: file.size,
        extension: file.name.split('.').pop().toLowerCase(),
        dataBlob: file,
        base64: base64,
        mimeType: file.type
      }]
    };

    return fieldFile;
  }

  /**
   * Força o download do arquivo no navegador do usuário.
   * Converte o Base64 de volta para Blob e cria um link temporário para download.
   * @param file Objeto IFile contendo o base64 e metadados.
   */
  downloadFile(file: IFile) {
    const base64Data = file.base64;
    const contentType = file.mimeType;
    const fileName = file.name;
    const base64Clean = base64Data.includes(',')
      ? base64Data.split(',')[1]
      : base64Data;

    const byteCharacters = atob(base64Clean);

    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }

  /**
   * Processa múltiplos arquivos simultaneamente.
   * Mapeia cada arquivo para uma Promise de conversão Base64 e aguarda todas finalizarem.
   * @param files Array de arquivos nativos.
   * @returns Objeto IFieldFile contendo a lista de arquivos processados.
   */
  async filesToFieldFiles(files: File[]): Promise<IFieldFile> {
    let fieldFile: IFieldFile = {
      fieldType: 'file',
      files: []
    };
    const promises = files.map(async (file) => {
      const base64 = await this.fileToBase64(file);

      return {
        name: file.name,
        size: file.size,
        extension: file.name.split('.').pop()?.toLowerCase() || '',
        dataBlob: file,
        base64: base64,
        mimeType: file.type
      };
    });

    const arquivosProcessados = await Promise.all(promises);

    fieldFile.files = arquivosProcessados;

    return fieldFile;
  }

  /**
   * Gera o rótulo de texto para o input (ex: nomes dos arquivos separados por vírgula).
   * @param fieldFile Objeto contendo os arquivos.
   * @returns String formatada com os nomes ou mensagem de "Sem Arquivo".
   */
  setFileLabel(fieldFile: IFieldFile): string {
    const files = fieldFile.files;
    let fileNames: string[] = [];
    files.forEach(file => {
      fileNames.push(file.name);
    });

    if (fileNames.length == 0) {
      return "Sem Arquivo" //TODO: Aplicar tradução
    }

    return this.setCharactersLimit(fileNames.join(","))
  }

  /**
   * Converte uma string Data URI (Base64 com metadados) para um objeto Blob.
   * @param dataURI String base64 completa (ex: 'data:image/png;base64,...').
   * @returns Blob binário do arquivo.
   */
  dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  /**
   * Orquestrador de validações. Verifica quantidade, extensões e tamanho.
   * Exibe SnackBar com erro caso alguma validação falhe.
   * @returns true se o arquivo for válido, false caso contrário.
   */
  checkFile(file: File | File[], allowedExtensions: string[], maxFileSize: number, maxInputFiles: number): boolean {
    if (!file) {
      return false;
    }
    if (!this.checkMaxInputFiles(file, maxInputFiles)) {
      this.matSnackBar.open(this.translocoService.translate('componentsBase.upload.maxFilesExceed'), 'OK', { duration: 3000 });
      return false;
    }
    if (!this.checkAllowedExtensions(file, allowedExtensions)) {
      this.matSnackBar.open(this.translocoService.translate('componentsBase.upload.unallowedExtensions'), 'OK', { duration: 3000 });
      return false;
    }
    if (!this.checkMaxFileSize(file, maxFileSize)) {
      this.matSnackBar.open(this.translocoService.translate('componentsBase.upload.fileSizeExceeded'), 'OK', { duration: 3000 });
      return false;
    }
    return true;
  }

  /**
   * Abre o modal (MatDialog) para visualização detalhada dos arquivos.
   * @param files Lista de arquivos a serem visualizados.
   */
  visualizarArquivo(files: IFile[]) {
    if(files.length == 0) return;
    this.matDialog.open(FileViwerComponent, {
      width: '100vw',    // Ocupa a largura da viewport
      maxWidth: '70vw', // Garante que não haja limitação de tema
      maxHeight: '70vw',
      panelClass: 'full-screen-modal', // Classe CSS personalizada
      data: files,
    })
  }

  /**
   * Valida se a quantidade de arquivos selecionados respeita o limite máximo.
   */
  private checkMaxInputFiles(file: File | File[], maxInputFiles: number): boolean {
    if (!maxInputFiles) return true;
    if (!Array.isArray(file)) return true;

    if (file.length > maxInputFiles) {
      return false
    }
    return true;
  }

  /**
   * Valida se as extensões dos arquivos correspondem às permitidas.
   */
  private checkAllowedExtensions(file: File | File[], allowedExtensions: string[]): boolean {
    if (allowedExtensions == null || allowedExtensions.length === 0) return true;

    if (Array.isArray(file)) {
      return file.some((f) => {
        if (!allowedExtensions.includes(f.name.split('.').pop().toLowerCase())) {
          return false;
        }
        return true;
      });
    } else {
      if (!allowedExtensions.includes(file.name.split('.').pop().toLowerCase())) {
        return false;
      }
      return true;
    }
  }

  /**
   * Valida se o tamanho dos arquivos está dentro do limite (em bytes).
   */
  private checkMaxFileSize(file: File | File[], maxFileSize: number): boolean {
    if (!maxFileSize) return true;
    if (Array.isArray(file)) {
      return file.some((f) => {
        if (f.size > maxFileSize) {
          return false;
        }
        return true;
      });
    } else {
      if (file.size > maxFileSize) {
        return false;
      }
      return true;
    }
  }

  /**
   * Lê o conteúdo de um arquivo usando FileReader e retorna como string Base64.
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result.toString());
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Obtém a URL segura (Sanitized) para o atributo 'src' (img/iframe).
   * Gerencia diferentes tipos de mídia (Imagem, PDF, Vídeo).
   * @param file Arquivo a ser exibido.
   * @returns SafeUrl para binding no template ou string com caminho de placeholder.
   */
  getBase64Src(file: IFile): SafeUrl | string {
    const fileType = this.identificarTipoArquivo(file.mimeType);
    let safeUrl: SafeUrl;
    switch (fileType) {
      case 'audio':
        //TODO: Audio base64 to src
        break;
      case 'imagem':
        safeUrl = this.getBase64SrcImage(file);
        this.safeUrlList.push(safeUrl);
        return safeUrl
      case 'pdf':
        safeUrl = this.getBase64SrcPdf(file);
        this.safeUrlList.push(safeUrl);
        return safeUrl
      case 'video':
        safeUrl = this.getBase64SrcImage(file);
        this.safeUrlList.push(safeUrl);
        return safeUrl
      default:
        this.matSnackBar.open(this.translocoService.translate('componentsBase.upload.fileTypeUnknown'), 'OK', { duration: 3000 });
        return 'assets/sem-imagem.png'
    }

  }

  /**
   * Prepara o base64 de uma imagem para ser exibido, adicionando prefixo MIME se necessário e sanitizando.
   */
  getBase64SrcImage(file: IFile): SafeUrl {
    let base64String = file.base64;

    if (!base64String) {
      return 'assets/sem-imagem.png';
    }

    if (!base64String.startsWith('data:image')) {
      const mimeType = file.mimeType || 'image/png';
      base64String = `data:${mimeType};base64,${base64String}`;
    }

    return this.sanitizer.bypassSecurityTrustUrl(base64String);

  }

  /**
   * Prepara o base64 de um PDF para exibição.
   * Converte para Blob URL para permitir visualização em iframes/embeds sem problemas de tamanho de string.
   */
  getBase64SrcPdf(arquivo: IFile): SafeUrl {
    let limpaBase64 = arquivo.base64;

    if (limpaBase64.includes(',')) {
      limpaBase64 = limpaBase64.split(',')[1];
    }

    limpaBase64 = limpaBase64.replace(/\s/g, '');

    try {
      const byteCharacters = atob(limpaBase64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], { type: 'application/pdf' });

      const urlCrua = URL.createObjectURL(blob);
      return this.sanitizer.bypassSecurityTrustResourceUrl(urlCrua);

    } catch (error) {
      console.error('Erro ao converter Base64:', error);
    }
  }


  /**
   * Helper simples para categorizar o arquivo baseado no MIME type.
   */
  identificarTipoArquivo(mimeType: string): 'imagem' | 'pdf' | 'video' | 'audio' | 'desconhecido' {
    if (mimeType.startsWith('image/')) return 'imagem';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'desconhecido'; // Para word, excel, zip, etc.
  }

  /**
   * Verifica estritamente se o arquivo é do tipo 'image/png'.
   */
  isImage(file: IFile): boolean {
    if (!file) return false;
    const regex = /^data:image\/(png|jpg|jpeg|gif|bmp|webp);base64,/;
    return regex.test(file.base64);
  }


  /**
   * Revoga todas as URLs de objeto (Blobs) criadas para liberar memória do navegador.
   */
  private destroySafeUrl(): void {
    if (this.safeUrlList.length == 0) return;

    for (let safeUrl in this.safeUrlList) {
      URL.revokeObjectURL(safeUrl)
    }
  }
}