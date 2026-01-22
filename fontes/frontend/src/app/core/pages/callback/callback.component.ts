import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {

  }

  ngOnInit(): void {

    this.authService.singleSignOn().subscribe({
      next: (value) => {
        console.log("valor obtido ao SSO: ", value);

        //TODO guardar os valores no localstorage
        this.redirectToApplication();
      },
      error: (error) => {
        this.redirectToSigninPage();
      },

    });
  }

  redirectToApplication() {
    this.router.navigate(['/home']);
  }

  redirectToSigninPage() {
    this.router.navigate(['/signin']);
  }

}
