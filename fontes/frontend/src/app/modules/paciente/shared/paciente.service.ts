import { Injectable, Injector } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from "app/modules/paciente/shared/paciente.model";
import { BaseResourceService } from 'app/shared/services/shared.service'; 
import { environment } from 'environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class PacienteService extends BaseResourceService<Paciente> {

  protected http: HttpClient 

  constructor(protected override injector: Injector) { 
    var url = environment.backendUrl+"/api/pacientes"; 

    super(url, injector, Paciente.fromJson) 
  } 
}
