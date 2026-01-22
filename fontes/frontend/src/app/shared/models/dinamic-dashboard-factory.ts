import { Injectable, Injector, ViewContainerRef } from "@angular/core";
import { DashboardField } from "./dashboard-field";
import { HorizontalBarField } from "../components/horizontal-bar-chart/horizontal-chart-field";
import { VerticalBarField } from "../components/vertical-bar-chart/vertical-chart-field";
import { PieField } from "../components/pie-chart/pie-chart-field";
import { LineField } from "../components/line-chart/line-chart-field";
import { IGraphic } from "./dashboardStructure";

@Injectable({
  providedIn: 'root'
})
export class DinamicDashboardFieldFactory implements DashboardField {
  constructor() { }

  createDashboardField(createComponentData: IGraphic, target: ViewContainerRef) {
    switch (createComponentData.charts.type) {
      case 'horizontal-bar-chart': {
        return new HorizontalBarField();
      }
      case 'vertical-bar-chart': {
        return new VerticalBarField();
      }
      case 'pie-chart': {
        return new PieField();
      }
      case 'line-chart': {
        return new LineField();
      }
      default:
        throw new Error('Unsupported field type');
    }
  }
}