export interface ICardValue {
    name: string;
    value: any;
    typeData: string;
    series?: string;
  }
  
  export interface ICharOptions {
    type: string;
    title: string;
    typeOfData: string;
    apiUrl: string;
    apiUrlFilter: string;
    colorSchema: string;
    animations: boolean;
    legendTitle: string;
    legendPosition: string;
    hideZeroValues: boolean;
    dataLabels: boolean;
    gridLines: boolean;
    xAxisLabel: string;
    yAxisLabel: string;
  }

  export interface IDashboardConfig {
    name: string;
    description: string;
    apiUrl: string;
    route: string;
  }

  export interface IGraphic {
    value: ICardValue;
    charts: ICharOptions;
  }
  
  export interface IDashboard {
    config: IDashboardConfig;
    graphic: IGraphic[];
  }