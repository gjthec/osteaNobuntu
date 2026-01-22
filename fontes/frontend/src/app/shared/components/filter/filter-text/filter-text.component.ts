import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SelectedFilter } from '../base-resource-filter.component';

interface TextFiltersOptions {
  value: string
}

@Component({
  selector: 'filter-text',
  templateUrl: './filter-text.component.html',
  styleUrls: ['./filter-text.component.scss']
})
export class FilterTextComponent implements OnInit, OnDestroy {
  /**
   * Dados de parâmetros do filtro que já foram preenchidos pelo usuário
   */
  @Input() selectedFilterData: SelectedFilter;
  /**
  * Irá emitir um sinal para o componente pai, enviando dados ligados a qual valor e parâmetro da busca deverá ser utilizados
  */
  @Output() newTextEvent = new EventEmitter<{ parameter: string, value: string }>();

  textFiltersOptions: TextFiltersOptions[] = [
    { value: "equal" },
    { value: "different" },
    { value: "startWith" },
    { value: "endWith" },
    { value: "contains" },
    { value: "dontContains" },
    { value: "match" }
  ]

  searchableText = new FormControl<string>('');

  selectedTextFiltersOptions = new FormControl<string>(this.textFiltersOptions[0][0]);
  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();

  ngOnInit(): void {
    this.loadValues();
    this.onChangeSearchableText();
    this.onChangeInSelectedFilter();
  }

  loadValues() {
    if (!this.selectedFilterData) {
      return;
    }

    if (this.selectedFilterData.filterValues) {
      this.searchableText.patchValue(this.selectedFilterData.filterValues.value);
      this.selectedTextFiltersOptions.patchValue(this.selectedFilterData.filterValues.parameter);

      this.markInvalid();
    }
  }

  onChangeSearchableText() {
    this.searchableText.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((newValue: string) => {
      this.newTextEvent.emit({ parameter: this.selectedTextFiltersOptions.value, value: newValue });
    });
  }

  onChangeInSelectedFilter() {
    this.selectedTextFiltersOptions.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((newParameter: string) => {
      this.newTextEvent.emit({ parameter: newParameter, value: this.searchableText.value });
    });
  }

  /**
   * Deixa o campo de inserção de dados do Formulário marcado como errado
   */
  markInvalid() {
    this.searchableText.markAsTouched();
    this.searchableText.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

}
