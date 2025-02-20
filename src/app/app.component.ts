import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { HeaderComponent } from './components/header/header.component';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { FooterComponent } from './components/footer/footer.component';


Amplify.configure(outputs);

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, AmplifyAuthenticatorModule, HeaderComponent, FooterComponent],
})
export class AppComponent {
  title = 'amplify-angular-template';

    
  constructor(public authenticator: AuthenticatorService) {
    Amplify.configure(outputs);
  }
  
}
