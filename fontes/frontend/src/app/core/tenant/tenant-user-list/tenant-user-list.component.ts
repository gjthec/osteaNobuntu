import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IUser } from 'app/core/auth/user.model';
import { TenantInviteUserFormComponent } from './tenant-invite-user-form/tenant-invite-user-form.component';
import { ITenant } from '../tenant.model';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-tenant-user-list',
  templateUrl: './tenant-user-list.component.html',
  styleUrls: ['./tenant-user-list.component.scss']
})
export class TenantUserListComponent implements OnInit {
  displayedColumns: string[] = ['checkbox','userName', 'email', 'edit'];

  /**
   * Controladores de dados da tabela
   */
  dataSource = new MatTableDataSource<IUser>();
  selection = new SelectionModel<IUser>(true, []);

  users: IUser[] = [];

  tenant: ITenant = {
    name: "teste",
  }

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.dataSource.data = this.users;
  }

  getUsers(){

  }

  openDialogTenantInviteUserForm(){
    this.dialog.open(TenantInviteUserFormComponent, {
      minWidth: "320px",
      minHeight:"200px",
    });
  }

  inviteUserToTenant(){

  }

  revokeUserPermissionOnTenant(){

  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.users.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.users);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: IUser): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'}`;
  }

}
