import { Injectable, Injector } from '@angular/core';
import { BaseResourceService } from './shared.service';
import { UserConfig } from '../models/user-config.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
// import { Invoices } from 'app/modules/invoices/shared/invoices.model';

@Injectable({
  providedIn: 'root'
})
export class UserConfigService extends BaseResourceService<UserConfig> {

  protected http: HttpClient;

  constructor(protected override injector: Injector) {
    var url = environment.backendUrl+"/api/userConfig"
    super(url, injector, UserConfig.fromJson)
  }
}
