import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SelectedFilter } from '../base-resource-filter.component';

@Component({
  selector: 'filter-boolean',
  templateUrl: './filter-boolean.component.html',
  styleUrls: ['./filter-boolean.component.scss']
})
export class FilterBooleanComponent implements OnInit, OnDestroy {
  /**
   * Dados de parâmetros do filtro que já foram preenchidos pelo usuário
   */
  @Input() selectedFilterData: SelectedFilter;
  /**
   * Irá emitir um sinal para o componente pai, enviando dados ligados a qual valor e parâmetro da busca deverá ser utilizados
   */
  @Output() newBooleanEvent = new EventEmitter<{ parameter: string, value: boolean }>();
  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();

  booleanValues: { value: string }[] = [
    { value: "true" },
    { value: "false" },
  ]

  searchableBoolean = new FormControl<boolean>(false);

  ngOnInit(): void {
    this.loadValues();
    this.onChangeSearchableBoolean();
  }

  loadValues() {
    if (!this.selectedFilterData) {
      return;
    }

    console.log("dados carregados no componente de boolean: ", this.selectedFilterData);

    if (this.selectedFilterData.filterValues) {
      this.searchableBoolean.patchValue(this.selectedFilterData.filterValues.value);
    }
  }

  onChangeSearchableBoolean() {
    this.searchableBoolean.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((newValue: boolean) => {
      this.newBooleanEvent.emit({ parameter: "equal", value: newValue });
    });
  }

  /**
   * Deixa o campo de inserção de dados do Formulário marcado como errado
   */
  markInvalid() {
    this.searchableBoolean.markAsTouched();
    this.searchableBoolean.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

}
