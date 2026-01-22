import { Injectable, Injector } from '@angular/core';
import { BaseResourceService } from './shared.service';
import { UserConfig } from '../models/user-config.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
// import { Invoices } from 'app/modules/invoices/shared/invoices.model';
import { BehaviorSubject } from 'rxjs';
import { UserConfigService } from './user-config.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserConfigLoaderService {

  constructor(
    private userConfigService: UserConfigService,
    private localStorageService: LocalStorageService
  ){

  }

  getDataFromServer(id){
    this.userConfigService.getById(id).subscribe(
      (data)=>{
        this.localStorageService.set("userConfig", data);
        return data;
      },
      (error)=>{
        console.error("Não foi possível obter dados do userConfig");
        return null;
      }
    )
  }

}
