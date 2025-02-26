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
  constructor(private store: Store, private router: Router) {
    Amplify.configure(outputs);
  }

  ngOnInit() {
    // Listen to auth events via Hub
    Hub.listen('auth', (data: any) => {
      const { payload } = data;
      // Check against the correct event names.
      if (payload.event === 'signedIn' && payload.data) {
        console.log('User signed in:', payload.data);
        this.store.dispatch(new SetAuthenticatedUser(payload.data));
        // on success redirect to home page.
        this.router.navigate(['/']);
      } else if (payload.event === 'signedOut') {
        console.log('User signed out');
        this.store.dispatch(new Logout());
      }
    });
  }

  // Optional: Wrap signOut if you want to trigger it manually.
  handleSignOut(signOutFn: Function) {
    signOutFn();
    // Optionally dispatch Logout directly if needed.
    // this.store.dispatch(new Logout());
  }
}