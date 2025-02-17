import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticatorService } from '@aws-amplify/ui-angular';

export const authGuard = () => {
  const authenticator = inject(AuthenticatorService);
  const router = inject(Router);

  if (authenticator.authStatus === 'authenticated') {
    return true;
  }

  return router.parseUrl('/');
};