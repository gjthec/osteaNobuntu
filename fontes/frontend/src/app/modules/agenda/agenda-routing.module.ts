import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgendaFormComponent } from './agenda-form/agenda-form.component'; 
import { ListAgendaComponent } from './list-agenda/list-agenda.component'; 


const routes: Routes = [
  { path: '', component: ListAgendaComponent}, 
  { path: 'new', component: AgendaFormComponent}, 
  { path: ':id/edit', component: AgendaFormComponent} 

];

@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class AgendaRoutingModule { }
