import { DashboardField } from 'app/shared/models/dashboard-field';
import { ViewContainerRef } from '@angular/core';
import { IDashboardOptions } from '../default-dashboard/default-dashboard.component';
import { PieChartComponent } from './pie-chart.component';
import { IGraphic } from 'app/shared/models/dashboardStructure';

export class PieField implements DashboardField {
    createDashboardField(createComponentData: IGraphic, data, target: ViewContainerRef) {
    let createdComponent = target.createComponent(PieChartComponent);
    createdComponent.instance.data = data;
    createdComponent.instance.title = createComponentData.charts.title;
    createdComponent.instance.typeOfData = createComponentData.charts.typeOfData;
    createdComponent.instance.colorSchema = createComponentData.charts.colorSchema;
    createdComponent.instance.animations = createComponentData.charts.animations;
    createdComponent.instance.legendTitle = createComponentData.charts.legendTitle;
    createdComponent.instance.legendPosition = createComponentData.charts.legendPosition;
    createdComponent.instance.hideZeroValues = createComponentData.charts.hideZeroValues;
    createdComponent.instance.dataLabels = createComponentData.charts.dataLabels;
    createdComponent.instance.gridLines = createComponentData.charts.gridLines;
    createdComponent.instance.xAxisLabel = createComponentData.charts.xAxisLabel;
    createdComponent.instance.yAxisLabel = createComponentData.charts.yAxisLabel;
    return createdComponent.instance;
    // createdComponent.instance.
    }
}