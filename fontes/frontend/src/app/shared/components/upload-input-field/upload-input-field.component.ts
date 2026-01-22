import { AfterViewInit, Component, Injector, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IFieldFile, IFile } from 'app/shared/models/file.model';
import { FileService } from 'app/shared/services/file.service';
import { Subject, take, takeUntil } from 'rxjs';
import { BaseUpoadFieldComponent } from '../base-field/base-upload-field.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-upload-input-field',
  templateUrl: './upload-input-field.component.html',
  styleUrls: ['./upload-input-field.component.scss']
})

export class UploadInputFieldComponent extends BaseUpoadFieldComponent implements OnInit, AfterViewInit {
  /**
   * Título que será apresentado no componente
   */
  @Input() label: string;
  /**
   * Quantidade limite de itens que podem ser selecionados
   */
  @Input() selectItemsLimit: number;
  /**
   * Lista de extensões de arquivo permitidas
   */
  @Input() allowedExtensions: string[] = []; // Exemplo de extensões permitidas
  /**
   * Nome da classe que pertence esse campo.
   */
  @Input() className: string;
  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();
  /**
   * Maximo de tamanho do arquivo
    */
  @Input() maxFileSize: number; // Exemplo de tamanho máximo de arquivo
  /**
      * Condicao de visibilidade do campo.
      */
  @Input() conditionalVisibility: { field: string, values: string[] }
  /**
  * FormGroup do formulario.
  */
  @Input() resourceForm: FormGroup<any>;

  public inputValue = new FormControl<IFieldFile>(null);
  fileName: string = '';
  displayedLabel: string = 'Upload de Arquivo';
  placeholder: string = 'Selecione um arquivo';
  charactersLimit: number = 100;
  isRequired: boolean = true;
  svgIcon: string = 'upload'; // Exemplo de ícone
  files: IFile[] = [];

  constructor(protected injector: Injector, protected fileService: FileService, protected matSnackBar: MatSnackBar, protected sanitizer: DomSanitizer, protected matDialog: MatDialog) {
    super(injector, fileService, matSnackBar, sanitizer, matDialog);
  }

  ngAfterViewInit(): void {
    this.setLabel();
  }

  ngOnInit(): void {
    this.checkConditional();
    this.showDataOnEdit();
  }


  showDataOnEdit(){
    this.inputValue.valueChanges.pipe(take(1)).subscribe((value: IFieldFile) => {
      if(!value.id) return;
      this.fileService.getFileWithEagerLoading(value.id).pipe(take(1)).subscribe(fieldFile =>{
        this.inputValue.setValue(fieldFile);
        this.files = fieldFile.files;
        this.fileName = this.getFileName(fieldFile)
      })
    })
  }

  getFileName(fieldFile: IFieldFile): string {
    const files = fieldFile.files;

    if(!Array.isArray(files)) {
      console.warn("Files não é array para pegar o nome.")
      return '';
    }

    let fileNames: string[] = [];
    files.forEach((file) => {
      fileNames.push(file.name);
    });
    return fileNames.join(', ');
  }
  
  checkConditional() {
    if (this.conditionalVisibility) {
      let initialFieldValue = this.resourceForm.get(this.conditionalVisibility.field)?.value;
      if (initialFieldValue && typeof initialFieldValue === 'object' && initialFieldValue.id) {
        initialFieldValue = initialFieldValue.id;
      }
      if (initialFieldValue !== null && typeof initialFieldValue !== 'string') {
        initialFieldValue = initialFieldValue.toString();
      }
      if (this.conditionalVisibility.values.includes(initialFieldValue)) {
        if (this.inputValue.disabled) {
          this.inputValue.enable();
        }
      } else {
        if (this.inputValue.enabled) {
          this.inputValue.disable();
        }
      }
  
      this.resourceForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(formValues => {
        let fieldValue = formValues[this.conditionalVisibility.field];
        if (fieldValue && typeof fieldValue === 'object' && fieldValue.id) {
          fieldValue = fieldValue.id;
        }
        const fieldValueStr = fieldValue?.toString();
        if (this.conditionalVisibility.values.includes(fieldValueStr)) {
          if (this.inputValue.disabled) {
            this.inputValue.enable();
          }
        } else {
          if (this.inputValue.enabled) {
            this.inputValue.disable();
          }
        }
      });
    }
  }



  /**
   * Método disparado quando um arquivo é selecionado
   */
  async onFileSelected(event: any) {
const fileList: FileList = event.target.files;

  // Transforma FileList em Array de File
  const files: File[] = Array.from(fileList);

    if(!this.checkFile(files, this.allowedExtensions, this.maxFileSize, this.selectItemsLimit)){
      return;
    }

    this.saveFile(files).then((response: IFieldFile) => {
      this.inputValue.setValue(response);
      this.files = response.files;
      this.fileName = this.setFileLabel(response);
    });
  }

  setLabel() {
    this.setTranslation(this.className, this.label).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (translatedLabel: string) => {
        if (translatedLabel === (this.className + "." + this.label)) {
          const formattedLabel = this.formatDefaultVariableName(this.label);
          this.displayedLabel = this.setCharactersLimit(formattedLabel, this.charactersLimit);
        } else {
          this.displayedLabel = this.setCharactersLimit(translatedLabel, this.charactersLimit);
        }
      },
      error: (error) => {
        this.displayedLabel = this.setCharactersLimit(this.label, this.charactersLimit);
      },
    });
  }

  // Define a posição do ícone (função opcional)
  setIconPosition() {
    return 'start'; // Ou 'end', conforme necessário
  }
}
