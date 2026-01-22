import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Application } from 'app/shared/services/application.service';

@Component({
  selector: 'app-confirm-change-app',
  templateUrl: './confirm-change-app.component.html',
  styleUrls: ['./confirm-change-app.component.scss']
})
export class ConfirmChangeAppComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ConfirmChangeAppComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  app: Application = this.data.app;

  ngOnInit(): void {
    console.log(this.data)
  }

}
