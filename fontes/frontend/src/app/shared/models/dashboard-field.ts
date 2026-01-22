import { ViewContainerRef } from "@angular/core";
import { IDashboardOptions } from "../components/default-dashboard/default-dashboard.component";
import { IGraphic } from "./dashboardStructure";

export interface DashboardField {
  createDashboardField(createComponentData: IGraphic, data: any, target: ViewContainerRef);
}