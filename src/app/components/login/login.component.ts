import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { Amplify, Hub } from '@aws-amplify/core';
import outputs from '../../../../amplify_outputs.json';
import { Store } from '@ngxs/store';
import { SetAuthenticatedUser, Logout } from '../../store/actions/auth.actions';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, AmplifyAuthenticatorModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private hubListener!: (data: any) => void;
  private hasDispatchedLogout = false;

  constructor(private store: Store, private router: Router) {
    Amplify.configure(outputs);
  }

  ngOnInit() {
    this.hubListener = (data: any) => {
      const { payload } = data;
      if (payload.event === 'signedIn' && payload.data) {
        console.log('User signed in:', payload.data);
        this.store.dispatch(new SetAuthenticatedUser(payload.data));
        this.router.navigate(['/']);
      } else if (payload.event === 'signedOut') {
        console.log('User signed out');
        if (!this.hasDispatchedLogout) {
          this.hasDispatchedLogout = true;
          this.store.dispatch(new Logout());
        }
      }
    };

    Hub.listen('auth', this.hubListener);
  }

  // Optionally, if you need to manually trigger sign out, you can do so.
  handleSignOut(signOutFn: Function) {
    signOutFn();
  }
}