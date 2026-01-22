import { AfterViewInit, Component, Injector, OnDestroy, ViewChild, ViewContainerRef } from "@angular/core"; 
import { Avaliacao } from "app/modules/avaliacao/shared/avaliacao.model"; 
import { AvaliacaoService } from "../shared/avaliacao.service"; 
import { ActivatedRoute, Router } from '@angular/router';
import { BaseResourceFormComponent } from "app/shared/components/form/form.component";  
import { FormGeneratorService } from "app/shared/services/form-generator.service";  
import { GeneratedFormFactoryService } from "app/shared/services/generated-form-factory.service";  
import { environment } from "environments/environment"; 
import { Subject, takeUntil } from "rxjs"; 

@Component({
  selector: 'app-details-avaliacao',
  templateUrl: './avaliacao-form.component.html',
  styleUrls: ['./avaliacao-form.component.scss']
})
export class AvaliacaoFormComponent extends BaseResourceFormComponent<Avaliacao> implements AfterViewInit, OnDestroy { 


  JSONPath : string = environment.avaliacaoJSONPath; 

  @ViewChild('placeToRender', {read: ViewContainerRef}) target!: ViewContainerRef; 
  /** 
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado. 
   */ 
//  private ngUnsubscribe = new Subject(); 

  constructor(
    protected avaliacaoService: AvaliacaoService,//Linha alterável com base na classe 
    protected injector: Injector, 
    private generatedFormFactoryService: GeneratedFormFactoryService, 
    private formGeneratorService: FormGeneratorService 
  ) { 
    super(injector, new Avaliacao(), avaliacaoService, Avaliacao.fromJson);//Linha alterável com base na classe 
    this.buildResourceForm(); 
  } 

  ngAfterViewInit(): void { 
    this.formGeneratorService.getJSONFromDicionario(this.JSONPath).pipe(takeUntil(this.ngUnsubscribe)).subscribe((JSONDictionary: any) => {

      this.generatedFormFactoryService.getDataToCreateFrom(JSONDictionary, this.target, ()=>{this.loadResource()}, this.resourceForm, ()=>{this.submitForm()}, ()=>{this.deleteResource()}, this.currentAction) 
    }); 
  } 

  getDataFromAPI() { 
    super.ngOnInit(); 
  } 

  protected buildResourceForm(): void { 
    this.resourceForm = this.formBuilder.group({ 
      id: [null], 
    }); 
  } 

//  ngOnDestroy(): void { 
//    this.ngUnsubscribe.next(null); 
//    this.ngUnsubscribe.complete(); 
//  } 
}
