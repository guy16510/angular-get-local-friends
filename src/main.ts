(window as any).global = window;

import 'zone.js'; // Ensure zone.js is imported if needed
import { bootstrapApplication } from '@angular/platform-browser';
import { APP_INITIALIZER } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Store, provideStore } from '@ngxs/store';
import { CheckAuth } from './app/store/actions/auth.actions';
import { provideHttpClient } from '@angular/common/http';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { withNgxsWebSocketPlugin } from '@ngxs/websocket-plugin'; //TODO remove this when you are done with todos

export function initAuth(store: Store) {
  return () => store.dispatch(new CheckAuth()).toPromise();
}

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [Store],
      multi: true,
    },
    provideHttpClient()]
}).catch((err) => console.error(err));