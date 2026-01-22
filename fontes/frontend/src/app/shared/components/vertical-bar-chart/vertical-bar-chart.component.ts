import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-vertical-bar-chart',
  templateUrl: './vertical-bar-chart.component.html',
  styleUrls: ['./vertical-bar-chart.component.scss']
})
export class VerticalBarChartComponent {
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

  constructor() { }

  ngAfterViewInit() {
    console.log(this.data)
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
