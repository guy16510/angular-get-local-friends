import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Amplify, Hub } from '@aws-amplify/core';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import outputs from '../../../../amplify_outputs.json';
import { Store } from '@ngxs/store';
import { CheckAuth, Logout } from '../../store/actions/auth.actions';
import { UpdateUserOnlineStatus } from '../../store/actions/user-profile.actions';


@Component({
  selector: 'app-login',
  imports: [AmplifyAuthenticatorModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribeHub?: () => void;
  private hasDispatchedLogout = false;

  // ✅ Corrected with explicit type:
  signUpAttributes: any = ['nickname', 'email'];

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {
    Amplify.configure(outputs);
  }

  ngOnInit() {
    this.unsubscribeHub = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') {
        this.store.dispatch(new CheckAuth()).subscribe((user: any) => {
          // User ping
          // this.store.dispatch(new UpdateUserOnlineStatus(user?.auth?.identityId));
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigate([returnUrl]);
        });
      }

      if (payload.event === 'signedOut' && !this.hasDispatchedLogout) {
        console.log('User signed out');
        this.hasDispatchedLogout = true;
        this.store.dispatch(new Logout());
      }
    });
  }

  ngOnDestroy() {
    if (this.unsubscribeHub) {
      this.unsubscribeHub();
    }
  }

  handleSignOut(signOutFn: Function) {
    signOutFn();
  }
}