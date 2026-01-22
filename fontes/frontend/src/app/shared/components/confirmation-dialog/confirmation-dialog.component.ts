import { Component, Inject, Input, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface IConfirmationDialog {
  message: string
}

@Component({
  selector: 'confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  @Input() message!: string;

  constructor(
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: IConfirmationDialog
  ) {
    if (data == null) return;
    this.message = data.message;

  }

  /**
   * Fecha o esse componente que foi aberto como dialog e retorna a opção selecionada pelo usuário.
   * @param option Opção selecionada pelo usuário.
   */
  closeDialog(option: boolean) {
    this.dialogRef.close(option);
  }
}
