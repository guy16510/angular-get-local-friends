import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { HeaderComponent } from './components/shared/header/header.component';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { FooterComponent } from './components/shared/footer/footer.component';
import { ToastMessageComponent } from './components/shared/toast-message/toast-message.component';

Amplify.configure(outputs);

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [
        RouterOutlet,
        AmplifyAuthenticatorModule,
        HeaderComponent,
        FooterComponent
    ]
})
export class AppComponent {

  constructor(public authenticator: AuthenticatorService) {
    Amplify.configure(outputs);
  }
}
