import { Injectable, ViewContainerRef } from '@angular/core';
import { Observable, take } from 'rxjs';
import { DashboardGeneratorService } from './dashboard-generator.service';
import { IDashboard } from '../models/dashboardStructure';
import { HttpClient } from '@angular/common/http';
import { DefaultGraphicComponent } from '../components/default-graphic/default-graphic.component';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';


// @Injectable()
@Injectable({
  providedIn: 'root'
})
export class DashboardFactoryService {

  constructor(
    public dashboardGenerator: DashboardGeneratorService,
    private httpClient: HttpClient,
    private location: Location,
    private matSnackBar: MatSnackBar
  ) {
  }

  /**
   * Criará a lista
   * @param target Referencia no HTML de onde será criado o componente da lista
   * @param JSONURL Caminho que se encontra o JSON que orienta na criação do componente
   */
  createDashboard(target: ViewContainerRef, JSONURL: string) {

    this.getDashboard(JSONURL).pipe(take(1)).subscribe((pageData: IDashboard) => {
      if (pageData == null) console.warn("Dados de criação de pagina não obtidos");
      if (target == null) console.warn("Target não instanciada");

      // const createdComponent = target.createComponent(DinamicDashboardFieldFactory).instance;
      pageData.graphic.forEach((graphic) => {
        const createdComponent = target.createComponent(DefaultGraphicComponent).instance;
        createdComponent.config = pageData.config;
        createdComponent.graphic = graphic;
        createdComponent.target = target;
      });
    }, (error) => {
      this.matSnackBar.open('Erro ao carregar o dashboard.', 'OK', { duration: 3000 });
      this.location.back();
    });
  }

  getDashboard(JSONURL: string): Observable<IDashboard> {
    return this.httpClient.get<IDashboard>(JSONURL);
  }

}
