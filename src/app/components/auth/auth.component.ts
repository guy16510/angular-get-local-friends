import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  AmplifyAuthenticatorModule,
  AuthenticatorService
} from '@aws-amplify/ui-angular';
import { Router } from '@angular/router';
// import '@aws-amplify/ui-angular/styles.css';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  standalone: true,
  imports: [CommonModule, AmplifyAuthenticatorModule],
  schemas: [NO_ERRORS_SCHEMA],
  styles: []
})
export class AuthComponent {
  constructor(private router: Router, private authenticator: AuthenticatorService) {}

  ngOnInit() {
    if (this.authenticator.authStatus === 'authenticated') {
      this.router.navigate(['/profile']);
    }
  }
}