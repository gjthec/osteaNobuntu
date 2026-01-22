import { Injectable, Injector } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agenda } from "app/modules/agenda/shared/agenda.model";
import { BaseResourceService } from 'app/shared/services/shared.service'; 
import { environment } from 'environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class AgendaService extends BaseResourceService<Agenda> {

  protected http: HttpClient 

  constructor(protected override injector: Injector) { 
    var url = environment.backendUrl+"/api/agenda"; 

    super(url, injector, Agenda.fromJson) 
  } 
}
