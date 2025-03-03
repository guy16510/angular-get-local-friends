import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngxs/store';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { ProgressState } from './store/states/progress.state';
import { AuthState } from './store/states/auth.state';
import { SurveyState } from './store/states/survey.state';
import { UserProfileState } from './store/states/user-profile.state';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { TodoState } from './store/states/todo.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideStore(
      [ProgressState, AuthState, SurveyState, UserProfileState, TodoState],
      withNgxsReduxDevtoolsPlugin({ name: 'GetLocalFriends' }),
      withNgxsLoggerPlugin(),
      withNgxsFormPlugin()
    )
  ]
};