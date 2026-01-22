import { Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

interface IConsultaPageStructure {
  path: string; 
  name: string; 
  component: Type<any>; 
} 

@Injectable({
  providedIn: 'root' 
}) 
export class ConsultaService { 

  consultaPages: IConsultaPageStructure[] = [ 
  ] 

  constructor( 
    private dialog: MatDialog, 
    private router: Router 
  ) { } 
  async openDialogByRoutePath<T>(path: string, dialogConfig?: any): Promise<MatDialogRef<T> | null> { 
    const componentType = await this.getComponentByRoutePath<T>(path); 

    if (componentType) { 
      return this.dialog.open<T>(componentType, dialogConfig); 
    } else { 
      console.error(`Componente para a rota "${path}" não encontrado.`); 
      return null; 
    } 
  } 

  private getComponentByRoutePath<T>(path: string): Promise<Type<T> | null> { 
    return new Promise((resolve) => { 
      const findComponent = (routesConfig: any[]): Type<T> | null => { 
        for (const route of routesConfig) { 
          if (route.path === path) { 
            return route.component as Type<T>; 
          } 
          if (route.children) { 
            const foundInChildren = findComponent(route.children); 
            if (foundInChildren) { 
              return foundInChildren; 
            } 
          } 
        } 
        return null; 
      }; 

      const component = findComponent(this.router.config); 
      resolve(component); 
    }); 
  } 

  getComponentByPath(path: string): Type<any> | null { 
    const page = this.consultaPages.find(p => p.path === path); 
    return page ? page.component : null; 
  } 

  getComponentByName(name: string): Type<any> | null { 
    const page = this.consultaPages.find(p => p.name === name); 
    return page ? page.component : null; 
  } 
} 
