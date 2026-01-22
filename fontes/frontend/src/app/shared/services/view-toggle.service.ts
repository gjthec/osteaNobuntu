import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewToggleService {
  private storageKey = 'viewMode';

  private viewModeSubject = new BehaviorSubject<string>(
    localStorage.getItem(this.storageKey) || 'list'
  );

  viewMode$ = this.viewModeSubject.asObservable();

  changeViewMode(mode: string) {
    this.viewModeSubject.next(mode);
    localStorage.setItem(this.storageKey, mode);
  }
}
