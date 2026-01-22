import { AfterViewInit, Component, Injector, Input } from '@angular/core';
import { BaseUpoadFieldComponent } from '../base-field/base-upload-field.component';
import { FileService } from 'app/shared/services/file.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IFieldFile, IFile } from 'app/shared/models/file.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-upload-field',
  templateUrl: './upload-field.component.html',
  styleUrl: './upload-field.component.scss',
  standalone: false
})
export class UploadFieldComponent extends BaseUpoadFieldComponent implements AfterViewInit {
    /**
     * Nome da classe que pertence esse campo.\
     * Exemplo: "Products".
     */
    @Input() className: string;
    /**
     * Campo de título desse campo.\
     * Exemplo: "Name".
     */
    @Input() label: string;
    /**
     * Valor apresentado no campo.
     */
    @Input() value: IFieldFile;

    fileNames: string = "Sem arquivo"
    fieldFile: IFieldFile;
    files: IFile[] = [];

      constructor(protected injector: Injector, protected fileService: FileService, protected matSnackBar: MatSnackBar, protected sanitizer: DomSanitizer, protected matDialog: MatDialog) {
          super(injector, fileService, matSnackBar, sanitizer, matDialog);
        }

    ngAfterViewInit(): void {
      this.getFieldFile();
    }
    
    getFieldFile() {
      if(!this.value) return;
      const idFieldFile = this.value.id;
      this.fileService.getFileWithEagerLoading(idFieldFile).subscribe((fieldFile: IFieldFile) => {
          this.fileNames = this.setFileLabel(fieldFile);
          this.fieldFile = fieldFile;
          this.files = fieldFile.files;
      });
    }
}
