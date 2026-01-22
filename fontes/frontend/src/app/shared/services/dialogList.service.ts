import { DialogListComponent } from '../component/dialog-list/dialog-list.component';
import { MatDialog } from '@angular/material/dialog';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface list {
  data: any;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class DialogListService {

  private debounceSubject = new Subject<string>();

  constructor(private dialog: MatDialog, private http: HttpClient) { }

  openDialogRadio(apiUrl: string, class_: string, displayedColumns: string[]): any {
    const dialogRef = this.dialog.open(DialogListComponent, {
      width: '1000px',
      data: {
        class: class_,
        apiUrl: apiUrl,
        displayedColumns: displayedColumns,
        type: 'radio'
      },
    });
  
    return dialogRef.afterClosed();
  }

  openDialogCheckbox(apiUrl: string, class_: string, displayedColumns: string[]): any {
    const dialogRef = this.dialog.open(DialogListComponent, {
      width: '1000px',
      data: {
        class: class_,
        apiUrl: apiUrl,
        displayedColumns: displayedColumns,
        type: 'checkbox'
      },
    });
  
    return dialogRef.afterClosed();
  }
}