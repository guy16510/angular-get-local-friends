import { ApplicationConfig } from '@angular/core';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { Amplify } from 'aws-amplify';

// Initialize Amplify
Amplify.configure({
  // Auth: {
  //   Cognito: {
  //     userPoolId: process.env['COGNITO_USER_POOL_ID'] || '',
  //     userPoolClientId: process.env['COGNITO_USER_POOL_CLIENT_ID'] || ''
  //   }
  // }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    AuthenticatorService
  ]
};
