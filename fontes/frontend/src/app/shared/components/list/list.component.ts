import { OnInit, Directive } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseResourceModel } from 'app/shared/models/base-resource.model';
import { BaseResourceService } from 'app/shared/services/shared.service';


@Directive()
export abstract class BaseResourceListComponent<T extends BaseResourceModel> implements OnInit {

  resources: T[] = [];

  constructor(private resourceService: BaseResourceService<T>, private matSnackBat: MatSnackBar) { }

  ngOnInit() {
    this.resourceService.getAll().subscribe(
      // resources => this.resources = resources.sort((a,b) => b.id - a.id),
      resources => this.resources = resources,
      error => this.matSnackBat.open("Erro ao carregar lista de recursos.", 'OK', { duration: 3000 }
    )
  }

  deleteResource(resource: T) {
    const mustDelete = confirm('Deseja realmente excluir este item?');
    
    if (mustDelete){
      this.resourceService.delete(resource.id).subscribe(
        () => this.resources = this.resources.filter(element => element != resource),
        () => this.matSnackBat.open("Erro ao tentar excluir o recurso.", 'OK', { duration: 3000 })
      )
    }
  }

}