import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { INavList } from '../side-nav.component';

@Component({
  selector: 'app-menu-choice',
  templateUrl: './menu-choice.component.html',
  styleUrls: ['./menu-choice.component.scss']
})
export class MenuChoiceComponent {
  constructor(
    public dialogRef: MatDialogRef<MenuChoiceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { environments: INavList[] }
  ) {
    console.log(this.environments)
  }

  environments: INavList[] = this.data.environments;

  onChooseEnvironment(environment: INavList): void {
    this.dialogRef.close(environment);
  }
}
