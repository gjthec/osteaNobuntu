import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent {
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
  view: any[] = [400, 200];

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
    // console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    // console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    // console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}
