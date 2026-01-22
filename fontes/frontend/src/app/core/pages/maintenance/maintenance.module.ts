import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaintenanceComponent } from './maintenance.component';
import { maintenanceRoutes } from './maintenance.routing';

@NgModule({
    declarations: [
        MaintenanceComponent
    ],
    imports     : [
        RouterModule.forChild(maintenanceRoutes)
    ]
})
export class MaintenanceModule
{
}
