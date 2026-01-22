import { Component } from '@angular/core';
import { DatabaseCredential, IDatabaseCredential } from '../databaseCredential.model';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DatabaseCredentialService } from '../databaseCredential.service';
import { take } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-database-credential-list',
  templateUrl: './database-credential-list.component.html',
  styleUrls: ['./database-credential-list.component.scss']
})
export class DatabaseCredentialListComponent {
  displayedColumns: string[] = ['checkbox', 'id', 'edit'];

  /**
   * Controladores de dados da tabela
   */
  dataSource = new MatTableDataSource<IDatabaseCredential>();
  selection = new SelectionModel<IDatabaseCredential>(true, []);

  databaseCredentials: DatabaseCredential[] = [];

  constructor(
    public dialog: MatDialog,
    private databaseCredentialService: DatabaseCredentialService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.databaseCredentialService.getAll().pipe(take(1)).subscribe({
      next: (databaseCredentials: DatabaseCredential[]) => {
        this.databaseCredentials = databaseCredentials;
        this.dataSource.data = this.databaseCredentials;
      },
    })

  }

  async getDatabaseCretentials(userUID: string) {
    // this.databaseCredentials = await this.databaseCredentialService.

    // console.log("tenants obtidos: ",this.tenants)
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.databaseCredentials.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.databaseCredentials);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: IDatabaseCredential): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'}`;
  }

  goToCreateNewDatabaseCredentialPage(){
    this.router.navigate(['/tenant/tenantCredential/add']);
  }
}
