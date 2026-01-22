import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { SelectedFilter } from '../base-resource-filter.component';

@Component({
  selector: 'filter-option',
  templateUrl: './filter-option.component.html',
  styleUrl: './filter-option.component.scss'
})
export class FilterOptionComponent {
  /**
   * Dados de parâmetros do filtro que já foram preenchidos pelo usuário
   */
  @Input() selectedFilterData: SelectedFilter;
  /**
   * Irá emitir um sinal para o componente pai, enviando dados ligados a qual valor e parâmetro da busca deverá ser utilizados
   */
  @Output() newOptionEvent = new EventEmitter<{ parameter: string, value: string }>();
  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();
  /**
   * Valores que o usuário poderá selecionar para que seja realizado a filtragem
   */
  @Input() selectorOptionValues: { id: string[] }[] = [];
  /**
   * Armazena opção pela qual o usuário definiu que quer filtrar
   */
  searchableOption = new FormControl<string>('');
  /**
   * Armazena o nome encurtado da linguagem na qual o SPA está no momento que esse componente é aberto.
   * Sendo usado para alterar qual string será apresentada no campo de opções a serem selecionadas
   */
  activeLanguage: string = "";

  constructor(private translocoService: TranslocoService) { }

  ngOnInit(): void {

    this.activeLanguage = this.translocoService.getActiveLang();

    this.loadValues();

    if (!this.selectorOptionValues && this.selectorOptionValues.length == 0) {
      console.error("Error on filter-selector. No options to select.");
      return;
    }

    this.onChangeSearchableOption();
  }

  loadValues() {
    if (!this.selectedFilterData) {
      return;
    }

    if (this.selectedFilterData.filterValues) {
      this.searchableOption.patchValue(this.selectedFilterData.filterValues.value);
    }

    this.markInvalid();
  }

  onChangeSearchableOption() {
    this.searchableOption.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((newValue: string) => {
      this.newOptionEvent.emit({ parameter: "equal", value: newValue });
    });
  }

  /**
   * Deixa o campo de inserção de dados do Formulário marcado como errado
   */
  markInvalid() {
    this.searchableOption.markAsTouched();
    this.searchableOption.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
