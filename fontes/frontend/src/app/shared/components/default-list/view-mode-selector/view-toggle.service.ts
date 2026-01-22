import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum ViewMode {
  listLayout = "list-layout",
  cardLayout = "card-layout"
}

@Injectable({
  providedIn: 'root',
})
export class ViewToggleService {
  private storageKey = 'viewMode';

  private viewModeSubject = new BehaviorSubject<ViewMode>(
    localStorage.getItem(this.storageKey) == ViewMode.listLayout ? ViewMode.listLayout : ViewMode.cardLayout || ViewMode.listLayout
  );

  viewMode$ = this.viewModeSubject.asObservable();

  changeViewMode(mode: ViewMode) {
    this.viewModeSubject.next(mode);
    localStorage.setItem(this.storageKey, mode.toString());
  }
}
