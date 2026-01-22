import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PacienteFormComponent } from './paciente-form/paciente-form.component'; 
import { ListPacienteComponent } from './list-paciente/list-paciente.component'; 


const routes: Routes = [
  { path: '', component: ListPacienteComponent}, 
  { path: 'new', component: PacienteFormComponent}, 
  { path: ':id/edit', component: PacienteFormComponent} 

];

@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class PacienteRoutingModule { }
