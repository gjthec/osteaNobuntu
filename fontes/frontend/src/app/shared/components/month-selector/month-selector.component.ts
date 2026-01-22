import { Component, EventEmitter, Input, OnInit, Output , OnChanges, SimpleChanges} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'month-selector',
  templateUrl: './month-selector.component.html',
  styleUrls: ['./month-selector.component.scss']
})
export class MonthSelectorComponent implements OnInit {
  // Recebe o valor do componente pai
  @Input() value: number = 1;

  // Emite as alterações do valor para o componente pai
  @Output() monthSelected = new EventEmitter<number>();

  monthControl: FormControl = new FormControl('', [Validators.required]);

  monthList = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

  monthsTranslations: string[] = [];

  constructor(private translocoService: TranslocoService) {}

  ngOnInit() {
    //Cria a lista de meses traduzidos
    this.loadTranslate();

    this.setInitialValue();

    this.monthControl.valueChanges.subscribe((selectedMonthKey) => {
      this.onMonthSelect(selectedMonthKey);
    });    
  }


  // Mapeia a chave do mês para o índice e emite para o pai
  onMonthSelect(selectedMonthKey: string): void {
    this.emitSelectMonth(selectedMonthKey);
  }

  // Método para atualizar o valor no campo de fora, se necessário
  ngOnChanges(changes: SimpleChanges) {
    if (changes.value && !changes.value.firstChange) {
      const newMonthKey = this.monthList[this.value - 1] || this.monthList[0];
      if (newMonthKey !== this.monthControl.value) {
        this.monthControl.setValue(newMonthKey);
      }
    }
  }

  private setInitialValue(){
    // Inicializa o valor do FormControl com base na entrada do pai
    const initialMonthKey = this.monthList[this.value - 1] || this.monthList[0];
    this.monthControl.setValue(initialMonthKey);
    this.emitSelectMonth(initialMonthKey);
  }

  private loadTranslate(){
    this.monthsTranslations = [];
    // Itera sobre a lista de meses e traduz cada um
    this.monthList.forEach((month) => {
      this.translocoService
        .selectTranslate(`months.${month}`, {}, 'components')
        .subscribe((translation) => {
          this.monthsTranslations.push(translation); // Adiciona a tradução ao array
        });
    });
  }

  private emitSelectMonth(selectedMonth: string): void {
    const monthIndex = this.monthList.indexOf(selectedMonth);
    if (monthIndex !== -1){
      this.monthSelected.emit(monthIndex + 1);
    }
  }

}
