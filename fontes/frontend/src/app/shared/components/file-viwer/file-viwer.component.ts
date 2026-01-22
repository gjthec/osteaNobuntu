import { AfterViewInit, Component, Inject, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BaseUpoadFieldComponent } from '../base-field/base-upload-field.component';
import { FileService } from 'app/shared/services/file.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IFile } from 'app/shared/models/file.model';

//TODO: Trazer os arquivos

@Component({
  selector: 'app-file-viwer',
  standalone: false,
  templateUrl: './file-viwer.component.html',
  styleUrl: './file-viwer.component.scss'
})
export class FileViwerComponent extends BaseUpoadFieldComponent implements AfterViewInit {

  pdfUrlSegura: SafeResourceUrl = '';
  indexActual: number = 0;

  constructor(private matDialogComponentRef: MatDialogRef<FileViwerComponent>,
                @Inject(MAT_DIALOG_DATA) public arquivo: IFile[],
                protected injector: Injector, 
                protected fileService: FileService, 
                protected matSnackBar: MatSnackBar, 
                protected sanitizer: DomSanitizer,
                protected matDialog: MatDialog) {
      super(injector, fileService, matSnackBar, sanitizer, matDialog);
  }

    ngAfterViewInit(): void {
    }


  proximo() {
    if (this.indexActual < this.arquivo.length - 1) {
      this.indexActual++;
    }
  }

  voltar() {
    if (this.indexActual > 0) {
      this.indexActual--;
    }
  }
}
