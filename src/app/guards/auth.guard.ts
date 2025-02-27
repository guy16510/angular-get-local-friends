import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../store/states/auth.state';

export const authGuard = () => {
  const router = inject(Router);
  const store = inject(Store);
  const isLoggedIn = store.selectSnapshot(AuthState.isLoggedIn);
  
  // If logged in, proceed; otherwise, redirect to login.
  return isLoggedIn ? true : router.parseUrl('/login');
};