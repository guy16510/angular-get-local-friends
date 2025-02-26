import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngxs/store';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { ProgressState } from './store/states/progress.state';
import { AuthState } from './store/states/auth.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: AmplifyAuthenticatorModule },
    provideAnimationsAsync(),
    provideStore([ProgressState, AuthState], withNgxsReduxDevtoolsPlugin())
  ]
};