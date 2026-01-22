import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, HostListener, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { IDashboardConfig, IGraphic } from 'app/shared/models/dashboardStructure';
import { DinamicDashboardFieldFactory } from 'app/shared/models/dinamic-dashboard-factory';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import html2canvas from 'html2canvas';
import { MatDialog } from '@angular/material/dialog';
import { ChartDateFilterComponent } from '../chart-date-filter/chart-date-filter.component';

export interface IDateRange {
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-default-graphic',
  templateUrl: './default-graphic.component.html',
  styleUrls: ['./default-graphic.component.scss']
})
export class DefaultGraphicComponent implements AfterViewInit {
  @Input() config: IDashboardConfig;
  @Input() graphic: IGraphic;
  componentGraphic: any;
  // @Input() target: ViewContainerRef;
  view: number[] = [400, 200];

  dateRange: IDateRange = { startDate: null, endDate: null };

  @ViewChild('placeToRender', { read: ViewContainerRef }) target: ViewContainerRef;

  constructor(private dinamicDashboard: DinamicDashboardFieldFactory, private http: HttpClient, private matDialog: MatDialog) { }

  ngAfterViewInit(): void {
    this.constructGraphic();
  }

  async constructGraphic() {
      this.requestAllValuesFromAPI(this.graphic).subscribe(data => {
        console.log(data);
        this.target.clear();
        this.componentGraphic = this.dinamicDashboard.createDashboardField(this.graphic, this.target);
        this.componentGraphic.createDashboardField(this.graphic, data, this.target);
      });
  }

  /**
  * Realiza uma requisição GET para API a partir do caminho passado.
  * @param apiUrl Caminho da API para realizar a requisição @example O trecho "api/carros" de "https://siteDoProgramador.com/api/carros"
  * @returns Retorna um observador que irá observar os dados que serão retornados da API.
  */
  requestAllValuesFromAPI(graphic: IGraphic): Observable<any> {
    const bodyParams = { name: graphic.value.name, value: graphic.value.value, type: graphic.value.typeData, series: graphic.value.series};
    return this.http.post(environment.backendUrl + '/' + graphic.charts.apiUrl, bodyParams);
  }

  filterData() {
    const dialogRef = this.matDialog.open(ChartDateFilterComponent, {
      width: '400px',
      data: { startDate: this.dateRange.startDate, endDate: this.dateRange.endDate }
    });

    dialogRef.afterClosed().subscribe((result: IDateRange) => {
      if(!result ) {
        this.dateRange = { startDate: null, endDate: null };
        this.constructGraphic();
        return;
      }
      this.dateRange = result;
      this.http.post(environment.backendUrl + '/' + this.graphic.charts.apiUrlFilter, { ...result, 
        name: this.graphic.value.name, value: this.graphic.value.value, series: this.graphic.value.series, typeFilter: "date" }).subscribe(data => {
          console.log(data);
          this.target.clear();
          this.componentGraphic.createDashboardField(this.graphic, data, this.target);
        });
    });
  }

  captureAndCopy() {
    const htmlElement = document.getElementById('graphic');
    console.log(htmlElement)
    if (htmlElement) {
      html2canvas(htmlElement, {width: 500, height: 500, useCORS: true, allowTaint: true }
      ).then(canvas => {
        // Converter para Base64
        canvas.toBlob(blob => {
          if (blob) {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(
              () => console.log('Imagem copiada para a área de transferência!'),
              err => console.error('Erro ao copiar a imagem: ', err)
            );
          }
        });
      });
    }
  }

  captureAndDownload() {
    const htmlElement = document.getElementById('graphic');
    if (htmlElement) {
      html2canvas(htmlElement).then(canvas => {
        // Converter para Base64
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'graphic.png';
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      });
    }
  }
}
