import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AvaliacaoFormComponent } from './avaliacao-form/avaliacao-form.component'; 
import { ListAvaliacaoComponent } from './list-avaliacao/list-avaliacao.component'; 


const routes: Routes = [
  { path: '', component: ListAvaliacaoComponent}, 
  { path: 'new', component: AvaliacaoFormComponent}, 
  { path: ':id/edit', component: AvaliacaoFormComponent} 

];

@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class AvaliacaoRoutingModule { }
