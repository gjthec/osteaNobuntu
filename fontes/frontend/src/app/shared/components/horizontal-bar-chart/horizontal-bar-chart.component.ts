import { AfterViewInit, Component, HostListener, Input } from '@angular/core';
import { ICardOptions, IDashboardOptions } from '../default-dashboard/default-dashboard.component';

@Component({
  selector: 'app-horizontal-bar-chart',
  templateUrl: './horizontal-bar-chart.component.html',
  styleUrls: ['./horizontal-bar-chart.component.scss']
})
export class HorizontalBarChartComponent implements IDashboardOptions, AfterViewInit {
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
  @Input() card: ICardOptions;
  @Input() type: string;
  @Input() apiUrl: string;
  view: any[];

  constructor() { }

  ngAfterViewInit() {
    this.onResize({ target: window });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // this.view = [event.target.innerWidth / 1.3, event.target.innerHeight / 1.3];
    this.view = [400, 200];
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
