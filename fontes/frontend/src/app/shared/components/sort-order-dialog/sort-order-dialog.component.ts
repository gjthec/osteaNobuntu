import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';

export interface SortOrderData {
  availableFields: SortField[];
  currentSorts?: SortOption[];
}

export interface SortField {
  name: string;
  displayName: {pt: string, en: string};
  type: string;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  order?: number; // Para indicar a prioridade da ordenação
}

@Component({
  selector: 'app-sort-order-dialog',
  templateUrl: './sort-order-dialog.component.html',
  styleUrls: ['./sort-order-dialog.component.scss']
})
export class SortOrderDialogComponent implements OnInit {

  sortForm: FormGroup;

  sortDirections = [
    { value: 'asc', label: 'Crescente' },
    { value: 'desc', label: 'Decrescente' }
  ];

  constructor(
    public dialogRef: MatDialogRef<SortOrderDialogComponent>,
    private translocoService: TranslocoService,
    @Inject(MAT_DIALOG_DATA) public data: SortOrderData
  ) {
    this.sortForm = new FormGroup({
      sortOptions: new FormArray([])
    });
  }

  ngOnInit(): void {
    // Se já há ordenações, carrega elas
    if (this.data.currentSorts && this.data.currentSorts.length > 0) {
      this.data.currentSorts.forEach(sort => {
        this.addSortOption(sort.field, sort.direction);
      });
    } else {
      // Adiciona uma opção vazia inicial
      this.addSortOption();
    }
  }

  get sortOptionsArray(): FormArray {
    return this.sortForm.get('sortOptions') as FormArray;
  }

  get availableFieldsForIndex(): (index: number) => SortField[] {
    return (index: number) => {
      const selectedFields = this.sortOptionsArray.controls
        .map((control, i) => i !== index ? control.get('field')?.value : null)
        .filter(field => field);
      
      return this.data.availableFields.filter(field => 
        !selectedFields.includes(field.name)
      );
    };
  }

  addSortOption(fieldValue: string = '', directionValue: string = 'asc'): void {
    const sortGroup = new FormGroup({
      field: new FormControl(fieldValue, [Validators.required]),
      direction: new FormControl(directionValue, [Validators.required])
    });

    this.sortOptionsArray.push(sortGroup);
  }

  removeSortOption(index: number): void {
    if (this.sortOptionsArray.length > 1) {
      this.sortOptionsArray.removeAt(index);
    }
  }

  moveUp(index: number): void {
    if (index > 0) {
      const current = this.sortOptionsArray.at(index);
      const previous = this.sortOptionsArray.at(index - 1);
      
      this.sortOptionsArray.setControl(index, previous);
      this.sortOptionsArray.setControl(index - 1, current);
    }
  }

  moveDown(index: number): void {
    if (index < this.sortOptionsArray.length - 1) {
      const current = this.sortOptionsArray.at(index);
      const next = this.sortOptionsArray.at(index + 1);
      
      this.sortOptionsArray.setControl(index, next);
      this.sortOptionsArray.setControl(index + 1, current);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.sortForm.valid) {
      const sortOptions: SortOption[] = this.sortOptionsArray.value
        .filter((sort: any) => sort.field && sort.direction)
        .map((sort: any, index: number) => ({
          field: sort.field,
          direction: sort.direction,
          order: index + 1
        }));
      
      this.dialogRef.close(sortOptions);
    }
  }

  onClearSort(): void {
    this.dialogRef.close([]);
  }

  canRemove(): boolean {
    return this.sortOptionsArray.length > 1;
  }

  hasAvailableFields(index: number): boolean {
    return this.availableFieldsForIndex(index).length > 1;
  }
}