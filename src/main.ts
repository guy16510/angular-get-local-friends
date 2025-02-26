(window as any).global = window;

import 'zone.js'; // Ensure zone.js is imported if needed
import { bootstrapApplication } from '@angular/platform-browser';
import { APP_INITIALIZER } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideStore, Store } from '@ngxs/store';
import { AuthState } from './app/store/states/auth.state';
import { CheckAuth } from './app/store/actions/auth.actions';

export function initAuth(store: Store) {
  return () => store.dispatch(new CheckAuth()).toPromise();
}

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideStore([AuthState]),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [Store],
      multi: true,
    },
  ],
}).catch((err) => console.error(err));