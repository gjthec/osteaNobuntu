import { HttpClient } from '@angular/common/http';
import { Component, Injector, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Variation } from 'app/modules/variations/shared/variations.model';
import { FormGeneratorService } from 'app/shared/services/form-generator.service';
import { BaseResourceFormComponent } from '../form/form.component';
import { BaseResourceModel } from 'app/shared/models/base-resource.model';
import { BaseResourceService } from 'app/shared/services/shared.service';
import { VariationService } from 'app/modules/variations/shared/variations.service';
import { OrderService } from 'app/modules/orders/shared/order.service';

@Component({
  selector: 'app-mat-stepper-form',
  templateUrl: './mat-stepper-form.component.html',
  styleUrls: ['./mat-stepper-form.component.scss']
})
export class MatStepperFormComponent {}
// export class MatStepperFormComponent<T extends BaseResourceModel> extends BaseResourceFormComponent<T> implements OnInit{
  
//   @Input() fieldsStepMap: string[][] = [["nomedousuario","telefone"],["genero","idade"]];
//   @Input() pathJSON: string = '../../../../assets/dicionario/variations.json';

//   @ViewChild('placeToRender', {read: ViewContainerRef}) target!: ViewContainerRef;

//   constructor(
//     protected injector: Injector,
//     protected resourceService: BaseResourceService<T>,
//     // public modelTest: T,
//     private jsonDataToResourceFn: (jsonData) => T,
//     private matDialog: MatDialog,
//     private formGenerator: FormGeneratorService,
//     private httpClient: HttpClient
//     ){
//     //super(injector, , resourceService, jsonDataToResourceFn);//Linha alterável com base na classe
//     super(injector, modelTest, resourceService, jsonDataToResourceFn);
//   } 

//   ngOnInit(): void {
//     super.ngOnInit();

//     this.formGenerator.getJSONFromDicionario(this.httpClient, this.pathJSON).subscribe((dicionarioJSON) => {//TODO o null será no caso a rota que ele buscará o JSON
//       const fieldsName = this.formGenerator.getAttributesName(dicionarioJSON);
//       const fieldsType = this.formGenerator.getAttributesType(dicionarioJSON);

//       setTimeout(() => { //TODO o certo é usar dentro do ngAfterViewInit, para fazer após tudo ser renderizado, mas tem que arrumar os problemas
//         this.formGenerator.createComponentsOnView(
//           this.target,
//           this.formBuilder,
//           this.resourceForm,
//           this.matDialog,
//           fieldsName,
//           fieldsType
//         )
//       }, 200);
//     });
    
//   }

//   protected buildResourceForm(): void {
//     this.resourceForm = this.formGenerator.buildResourceForm(this.formBuilder);
//   }

//   printForm(){
//     console.log(this.resourceForm.value);
//   }
// }
