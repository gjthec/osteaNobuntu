import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ItemBase } from 'app/shared/models/item-base.module';
import { Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SelectedFilter } from '../base-resource-filter.component';

interface DateFiltersOptions {
  value: string
}

@Component({
  selector: 'filter-period',
  templateUrl: './filter-period.component.html',
  styleUrls: ['./filter-period.component.scss']
})
export class FilterPeriodComponent implements OnInit, OnDestroy {
  /**
   * Dados de parâmetros do filtro que já foram preenchidos pelo usuário
   */
  @Input() selectedFilterData: SelectedFilter;
  /**
   * Irá emitir um sinal para o componente pai, enviando dados ligados a qual valor e parâmetro da busca deverá ser utilizados
   */
  @Output() newDateEvent = new EventEmitter<{ parameter: string, value: Date | { start: Date, end: Date } | number }>();

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  selectedDate = new FormControl<Date | null>(null);

  selectedDateNumeric = new FormControl<number | null>(null);

  @Input() variables: ItemBase[];

  dateFiltersOptions: DateFiltersOptions[] = [
    { value: "day" },
    { value: "month" },
    { value: "year" },
    { value: "week" },
    { value: "completeDate" },
    { value: "equal" },
    { value: "different" },
    { value: "afterThan" },
    { value: "afterOrEqualThan" },
    { value: "beforeThan" },
    { value: "beforeOrEqualThan" },
    { value: "between" }
  ]

  selectedDateFiltersOption = new FormControl<string>(this.dateFiltersOptions[0][0]);

  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();

  constructor() { }

  ngOnInit(): void {
    this.loadValues();
    this.onValueChangesInDateRange();
    this.onValueChangesInDate();
    this.onValueChangesInSelectedFilter();
    this.onValueChangesInSelectedDateNumeric();
  }

  loadValues() {

    if (!this.selectedFilterData) {
      return;
    }

    if (!this.selectedFilterData.filterValues) {
      return;
    }

    this.selectedDateFiltersOption.patchValue(this.selectedFilterData.filterValues.parameter);


    if (!this.selectedFilterData.filterValues.value) {
      return;
    }

    // Carregamento de valores para o caso de ser um range de datas
    if (this.selectedFilterData.filterValues.parameter == "between") {

      if (!this.selectedFilterData.filterValues.value.start ||
        !this.selectedFilterData.filterValues.value.end
      ) {
        console.error("Invalid filter search parameters date.");
        return null;
      }

      this.range.get('start')?.setValue(new Date(this.selectedFilterData.filterValues.value.start));
      this.range.get('end')?.setValue(new Date(this.selectedFilterData.filterValues.value.end));
    } else {
      if (this.inputFieldIsNumeric() == true) {
        this.selectedDateNumeric.patchValue(this.selectedFilterData.filterValues.value);
      } else {
        this.selectedDate.patchValue(this.selectedFilterData.filterValues.value);
      }
    }


  }

  onValueChangesInDateRange() {
    this.range.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((newDate: { start: Date, end: Date }) => {
      this.newDateEvent.emit({ parameter: this.selectedDateFiltersOption.value, value: newDate });
    });
  }

  onValueChangesInDate() {
    this.selectedDate.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((newDate: Date) => {
      this.newDateEvent.emit({ parameter: this.selectedDateFiltersOption.value, value: newDate });
    });
  }

  onValueChangesInSelectedFilter() {
    this.selectedDateFiltersOption.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((newParameter: string) => {
      if (newParameter == "between") {
        this.newDateEvent.emit({ parameter: newParameter, value: null })
      } else {
        this.newDateEvent.emit({ parameter: newParameter, value: null })
      }
    });
  }

  onValueChangesInSelectedDateNumeric() {
    this.selectedDateNumeric.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((newDate: number) => {
      if (this.inputFieldIsNumeric() == true) {
        this.newDateEvent.emit({ parameter: this.selectedDateFiltersOption.value, value: newDate });
      }
    });
  }

  inputFieldIsNumeric(): boolean {
    const numericFilterOptions = ['day', 'month', 'year', 'week'];
    if (numericFilterOptions.includes(this.selectedDateFiltersOption.value) == true) {
      return true;
    }
    return false;
  }

  /**
   * Deixa o campo de inserção de dados do Formulário marcado como errado
   */
  markInvalid() {
    this.selectedDate.markAsTouched();
    this.selectedDate.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

}
