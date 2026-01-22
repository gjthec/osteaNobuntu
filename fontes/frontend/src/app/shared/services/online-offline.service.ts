import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineOfflineService {

  private onlineStatusSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public onlineStatus$ = this.onlineStatusSubject.asObservable();


  constructor() {
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
  }

  private updateOnlineStatus() {
    this.onlineStatusSubject.next(navigator.onLine);
  }

  public get isOnline(): boolean {
    return navigator.onLine;
  }
}
