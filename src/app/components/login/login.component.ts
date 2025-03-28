// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Router, ActivatedRoute } from '@angular/router';
// import { Amplify, Hub } from '@aws-amplify/core';
// import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
// import { Store } from '@ngxs/store';
// import { CheckAuth, Logout } from '../../store/actions/auth.actions';
// import { UpdateUserOnlineStatus } from '../../store/actions/user-profile.actions';


// @Component({
//   selector: 'app-login',
//   imports: [AmplifyAuthenticatorModule],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss'],
// })
// export class LoginComponent implements OnInit, OnDestroy {
//   private unsubscribeHub?: () => void;
//   private hasDispatchedLogout = false;

//   // ✅ Corrected with explicit type:
//   signUpAttributes: any = ['nickname', 'email'];

//   constructor(
//     private store: Store,
//     private router: Router,
//     private route: ActivatedRoute
//   ) {
//   }

//   ngOnInit() {
//     this.unsubscribeHub = Hub.listen('auth', ({ payload }) => {
//       if (payload.event === 'signedIn') {
//         this.store.dispatch(new CheckAuth()).subscribe((user: any) => {
//           // User ping
//           // this.store.dispatch(new UpdateUserOnlineStatus(user?.auth?.identityId));
//           const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
//           this.router.navigate([returnUrl]);
//         });
//       }

//       if (payload.event === 'signedOut' && !this.hasDispatchedLogout) {
//         console.log('User signed out');
//         this.hasDispatchedLogout = true;
//         this.store.dispatch(new Logout());
//       }
//     });
//   }

//   ngOnDestroy() {
//     if (this.unsubscribeHub) {
//       this.unsubscribeHub();
//     }
//   }

//   handleSignOut(signOutFn: Function) {
//     signOutFn();
//   }
// }

import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Hub } from '@aws-amplify/core';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { Store } from '@ngxs/store';
import { CheckAuth, Logout } from '../../store/actions/auth.actions';
// import { UpdateUserOnlineStatus } from '../../store/actions/user-profile.actions';
// import { SetUserProfile } from '../../store/actions/user.actions'; // Optional for future

@Component({
  selector: 'app-login',
  imports: [AmplifyAuthenticatorModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribeHub?: () => void;
  private hasDispatchedLogout = false;

  signUpAttributes: any = ['nickname', 'birthdate']; // email handled by loginWith.email

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.unsubscribeHub = Hub.listen('auth', async ({ payload }) => {
      if (payload.event === 'signedIn') {
        try {
          const [user, attributes] = await Promise.all([
            getCurrentUser(),
            fetchUserAttributes()
          ]);

          console.log('User signed in with attributes:', attributes);

          const picture = attributes.picture;
          const nickname = attributes.nickname;
          const birthdate = attributes.birthdate;

          // Optionally store extra profile info
          console.log('User profile:', { picture, nickname, birthdate });
          // this.store.dispatch(new SetUserProfile({ picture, nickname, birthdate }));

          this.store.dispatch(new CheckAuth()).subscribe((user: any) => {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigate([returnUrl]);
          });
        } catch (err) {
          console.error('Failed to fetch user after sign-in:', err);
        }
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