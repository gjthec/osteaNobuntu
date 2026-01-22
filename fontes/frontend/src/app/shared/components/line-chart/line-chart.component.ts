import { AfterViewInit, Component, HostListener, Input } from '@angular/core';
import 'moment/locale/pt-br';  // Importar localização para português do Brasil



@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements AfterViewInit {
  @Input() data: any[];
  @Input() title: string;
  @Input() typeOfData: string;
  @Input() colorSchema: string;
  @Input() animations: boolean;
  @Input() legendTitle: string;
  @Input() legendPosition: string;
  @Input() hideZeroValues: boolean;
  @Input() dataLabels: boolean;
  @Input() gridLines: boolean;
  @Input() xAxisLabel: string;
  @Input() yAxisLabel: string;
  view: any[];

  yAxisTickFormatting(value: number): string {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  timeline: boolean = true;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  constructor() { }

  ngAfterViewInit() {
    this.onResize({ target: window });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.view = [event.target.innerWidth / 1.3, event.target.innerHeight / 1.3];
  }

  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}
