import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'default-table',
  templateUrl: './default-table.component.html',
  styleUrls: ['./default-table.component.scss']
})
export class DefaultTableComponent implements OnInit, OnDestroy {
  /**
   * Campo com nome de itens que serão apresentados na lista.
   * @example ['nome', 'idade'].
   */
  @Input() itemsDisplayed: any[] = [];
  /**
   * Nomes dos campos que serão apresentados.
   * @example ['nome', 'idade'].
   */
  @Input() displayedfieldsName: string[] | null;
  /**
   * Tipos das variáveis da classe.
   * @example ['string', 'number'].
   */
  @Input() fieldsType: string[];
  /**
   * Essa lista será uma lista que tu seleciona os itens?
   * @example true;
   */
  @Input() isSelectable: boolean = true;
  /**
   * Valor máximo de itens que podem ser selecionados.
   * @example 2.
   * Exemplo para querer poder selecionar tudo: null.
   */
  @Input() selectedItemsLimit: number = null;
  /**
   * Campo que saída para os valores que foram selecionados.
   */
  @Output() eventSelectedValues = new EventEmitter<any[]>();
  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();

  selection = new SelectionModel<any>(true, []); // Array de seleção

  pressedColumn: string | null = null;

  constructor(){

  }
  
  ngOnInit(): void {
    this.displayedfieldsName = ['selectableField', ...this.displayedfieldsName];

    this.selection.changed.pipe(takeUntil(this.ngUnsubscribe)).subscribe((newValue)=>{
      this.eventSelectedValues.emit(this.selection.selected);
    });
  }

  sortByProperty(fieldName: string){
    if(this.itemsDisplayed.length == 0) return null;

    const data = this.itemsDisplayed.slice().sort((a, b) => {
      
      const valueA = a[fieldName] !== undefined ? a[fieldName] : Number.MAX_SAFE_INTEGER;
      const valueB = b[fieldName] !== undefined ? b[fieldName] : Number.MAX_SAFE_INTEGER;
  
      if (valueA < valueB) {
        return -1;
      } else if (valueA > valueB) {
        return 1;
      } else {
        return 0;
      }
    });

    this.itemsDisplayed = data;
  }

  select(row): void {
    this.selection.toggle(row);
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.itemsDisplayed.length;
    return numSelected === numRows;
  }

  selectAll(): void {
    if(this.isAllSelected() == true){
      this.selection.clear()
    } else {
      this.itemsDisplayed.forEach(row => this.selection.select(row));
    }     
  }

  setPressedColumn(column: string): void {
    this.pressedColumn = column;
  }

  clearPressedColumn(): void {
    this.pressedColumn = null;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
