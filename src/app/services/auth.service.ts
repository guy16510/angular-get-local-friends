import {  Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import {  fetchAuthSession } from 'aws-amplify/auth';
import { Login, Logout, CheckAuth, FetchIdentityId} from '../store/actions/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private store: Store) {}

  login(username: string, password: string) {
    return this.store.dispatch(new Login(username, password));
  }

  logout() {
    return this.store.dispatch(new Logout());
  }

  checkAuth() {
    return this.store.dispatch(new CheckAuth());
  }

  getIdentityId() {
    return this.store.dispatch(new FetchIdentityId());
  }

}