import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {

  private subTituloSubject = new BehaviorSubject<string>(environment.applicationTitle);
  subTitulo$ = this.subTituloSubject.asObservable();

  constructor(private titleService: Title) {}

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  getTitle() {
    return this.titleService.getTitle();
  }

  setSubTitle(newSubTitle: string) {
    this.subTituloSubject.next(newSubTitle);
  }
}
