import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApplicationService } from 'app/shared/services/application.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { IUser } from 'app/core/auth/user.model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  currentUser: IUser = {
    UID: '',
    TenantUID: '',
    userName: '',
    firstName: '',
    lastName: '',
    isAdministrator: false,
    memberType: ''
  };
  user = {
    userId: '',
    displayName: '',
    givenName: '',
    surname: '',
    businessPhones: '',
    jobTitle: '',
    mobilePhone: '',
    officeLocation: '',
    preferredLanguage: '',
  };
  constructor(
    private http: HttpClient,
    private applicationService: ApplicationService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const profile = this.currentUser || {};
    const user=this.currentUser
    this.user = {
      userId: user.UID || '',
      displayName: user.userName || '',
      givenName: user.firstName || '',
      surname: user.lastName || '',
      businessPhones: '',
      jobTitle: '',
      mobilePhone: '',
      officeLocation: '',
      preferredLanguage: '',
    };
  }

  onSubmit() {
    this.applicationService.updateUserProfile(this.user)
      .subscribe(
        (response: any) => {
          console.log('Profile updated successfully!', response);
          this.snackBar.open('Perfil atualizado com sucesso!', 'Close', {
            duration: 3000,
          });
          // Atualizar o profile no currentUser no localStorage
          this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          this.currentUser = {
            ...this.currentUser,
            userName: this.user.displayName,
            firstName: this.user.givenName,
            lastName: this.user.surname,
          };
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          this.router.navigate(['/']); // Navegar de volta ao perfil ou outra página
        },
        (error) => {
          console.error('Erro ao atualizar perfil!', error);
          this.snackBar.open('Erro ao atualizar o perfil', 'Close', {
            duration: 3000,
          });
        }
      );
  }
}
