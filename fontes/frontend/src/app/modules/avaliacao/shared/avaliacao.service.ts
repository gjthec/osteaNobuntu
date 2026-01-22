import { Injectable, Injector } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avaliacao } from "app/modules/avaliacao/shared/avaliacao.model";
import { BaseResourceService } from 'app/shared/services/shared.service'; 
import { environment } from 'environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class AvaliacaoService extends BaseResourceService<Avaliacao> {

  protected http: HttpClient 

  constructor(protected override injector: Injector) { 
    var url = environment.backendUrl+"/api/AvaliacoesColunaLombar"; 

    super(url, injector, Avaliacao.fromJson) 
  } 
}
