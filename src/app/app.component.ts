import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { HeaderComponent } from './components/shared/header/header.component';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { FooterComponent } from './components/shared/footer/footer.component';
// import { ToastMessageComponent } from './components/shared/toast-message/toast-message.component';
import { Store } from '@ngxs/store';
import { UpdateUserOnlineStatus } from './store/actions/user-profile.actions';
import { AuthState } from './store/states/auth.state';

// Amplify.configure(outputs);
outputs.auth.oauth.domain = 'dev-getlocalfriends-auth.auth.us-east-1.amazoncognito.com';

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
export class AppComponent implements OnInit{

  constructor(public authenticator: AuthenticatorService, private store: Store) {
    Amplify.configure(outputs);
  }

  ngOnInit() {
    // Hearbeat every minute?
    setInterval(() => {
      const identityId = this.store.selectSnapshot(AuthState.identityId);
      if (identityId) {
        this.store.dispatch(new UpdateUserOnlineStatus()); 
      }
    }, 120000); // every 2min
  }
}
