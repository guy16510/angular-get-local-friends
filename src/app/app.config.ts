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
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { ChatState } from './store/states/chat.state';
import { SearchState } from './store/states/search.state';
import { GeolocationState } from './store/states/geolocation.state';
import { CompatibilityState } from './store/states/compatibility.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideStore([
        ProgressState, 
        AuthState, 
        SurveyState, 
        UserProfileState, 
        ChatState,
        SearchState,
        GeolocationState,
        CompatibilityState
      ],
      withNgxsReduxDevtoolsPlugin({ name: 'GetLocalFriends' }),
      withNgxsStoragePlugin({ keys: ['search'] }),
      withNgxsLoggerPlugin(),
      withNgxsFormPlugin(),
    )
  ]
};