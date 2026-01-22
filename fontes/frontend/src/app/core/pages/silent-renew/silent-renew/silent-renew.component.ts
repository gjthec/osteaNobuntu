import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-silent-renew',
  templateUrl: './silent-renew.component.html',
  styleUrls: ['./silent-renew.component.scss']
})
export class SilentRenewComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.loginSilent();
  }
}