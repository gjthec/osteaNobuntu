import { DIALOG_DATA } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from 'environments/environment';
import { take } from 'rxjs';
import { FilterService } from '../filter.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';

export enum FormMode {
  "edit",
  "save"
}

@Component({
  selector: 'filter-form',
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.scss']
})
export class FilterFormComponent implements OnInit {
  FormMode = FormMode;

  @Output() notifyParentToReturnToLastPage = new EventEmitter<boolean>();

  @Input() initialData?: any; // dados para preencher o form
  @Input() mode: FormMode = FormMode.save; // modo do formulário

  filterFormGroup: FormGroup = this._formBuilder.group({
    id: [undefined],
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    isPublic: [false],
    parameters: ['', [Validators.required]],
    className: ['', [Validators.required]],
  });

  formMode: FormMode = FormMode.save;
  isLoading: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private filterService: FilterService,
    // Componente para avisos
    private snackBar: MatSnackBar,
    // Tradução dos avisos
    private transloco: TranslocoService,
    //Caso aberto como dialog/popup
    private dialogReference: MatDialogRef<FilterFormComponent>,
    @Optional() @Inject(DIALOG_DATA) private dialogData: { id?: number, name?: string, isPublic?: boolean, parameters: any[], className: string, formMode: FormMode }
  ) {
    this.setValuesOnForm(this.dialogData);
  }

  ngOnInit(): void {
    // Atualiza o modo se foi passado via Input
    if (this.mode) {
      this.formMode = this.mode;
    }

    // Preenche o formulário se dados foram passados
    if (this.initialData) {
      this.setValuesOnForm(this.initialData);
    }
  }

  setValuesOnForm(dialogData) {
    if (dialogData) {
      const partial: any = {};
      if (dialogData.id !== undefined) {
        partial.id = dialogData.id;
      }
      if (dialogData.name !== undefined) {
        partial.name = dialogData.name;
      };
      if (dialogData.isPublic !== undefined) {
        partial.isPublic = dialogData.isPublic;
      };
      if (dialogData.parameters !== undefined) {
        partial.parameters = dialogData.parameters;
      };
      if (dialogData.className !== undefined) {
        partial.className = dialogData.className;
      };

      this.filterFormGroup.patchValue(partial);
      this.formMode = dialogData.formMode;
    }
  }

  submit() {

    const actionButtonMessage = this.transloco.translate('componentsBase.snackbar.close');
    this.isLoading = true;

    this.httpClient.post(environment.backendUrl + "/api/filter-search-parameters", this.filterFormGroup.value).pipe(take(1)).subscribe({
      next: (value) => {
        this.isLoading = false;

        // Fechar essa pagina
        this.closeThisDialog();

        // Atualizar filtros em memória
        this.filterService.fetchSearchFilterParameterList(this.filterFormGroup.value.className);

        const message = this.transloco.translate('componentsBase.alerts.createSuccessMessage');
        this.openSnackBarToAlert(message, actionButtonMessage);
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
        const message = this.transloco.translate('componentsBase.alerts.createErrorMessage');
        this.openSnackBarToAlert(message, actionButtonMessage);
      },
    });
  }

  update() {

    const actionButtonMessage = this.transloco.translate('componentsBase.snackbar.close');
    this.isLoading = true;

    this.httpClient.put(environment.backendUrl + "/api/filter-search-parameters/" + this.filterFormGroup.value.id, this.filterFormGroup.value).pipe(take(1)).subscribe({
      next: (value) => {
        this.isLoading = false;

        // Fechar essa pagina
        this.closeThisDialog();

        // Atualizar filtros em memória
        this.filterService.fetchSearchFilterParameterList(this.filterFormGroup.value.className);

        const message = this.transloco.translate('componentsBase.alerts.updateSuccessMessage');
        this.openSnackBarToAlert(message, actionButtonMessage);
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;

        const message = this.transloco.translate('componentsBase.alerts.updateErrorMessage');
        this.openSnackBarToAlert(message, actionButtonMessage);
      },
    });
  }

  closeThisDialog() {
    this.dialogReference.close();
  }

  returnToLastPage() {
    this.notifyParentToReturnToLastPage.emit(false);
  }

  openSnackBarToAlert(message: string, actionButtonMessage: string) {

    this.snackBar.open(message, actionButtonMessage, {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      // panelClass: ['snackbar-copy'] // opcional: classe para estilo
    });
  }
}
