// auth.state.ts
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { signIn, signOut, getCurrentUser, fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { CheckAuth, Login, Logout, FetchIdentityId, SetAuthenticatedUser } from '../actions/auth.actions';

export interface AuthStateModel {
  user: any;
  identityId: string | null;
  loading: boolean;
  error: string | null;
  userName: string | null;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    identityId: null,
    loading: false,
    error: null,
    userName: null
  }
})
@Injectable()
export class AuthState {
  
  @Selector()
  static isLoggedIn(state: AuthStateModel): boolean {
    return !!state.user;
  }

  @Selector()
  static user(state: AuthStateModel): any {
    return state.user;
  }

  @Selector()
  static userName(state: AuthStateModel): any {
    return state.userName;
  }
  
  @Selector()
  static identityId(state: AuthStateModel): string | null {
    return state.identityId;
  }

  @Selector()
  static loading(state: AuthStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: AuthStateModel): string | null {
    return state.error;
  }
  
  @Action(CheckAuth)
  async checkAuth({ patchState }: StateContext<AuthStateModel>) {
    patchState({ loading: true, error: null });
  
    try {
      const currentUser = await getCurrentUser();
      
      // ✅ Fetch user attributes
      const userAttributes = await fetchUserAttributes();
      const nickname = userAttributes?.nickname || null;
  
      // ✅ Store user details including nickname in the state
      patchState({ 
        user: { ...currentUser, nickname, attributes: userAttributes },
        userName: nickname,
        loading: false 
      });
    } catch (error: any) {
      patchState({ user: null, loading: false, error: error.message || 'Error checking auth' });
    }
  }
  
  @Action(Login)
  async login({ patchState }: StateContext<AuthStateModel>, action: Login) {
    patchState({ loading: true, error: null });
    try {
      const signInResult = await signIn({ username: action.username, password: action.password });
      patchState({ user: signInResult, loading: false });
      return signInResult;
    } catch (error: any) {
      patchState({ loading: false, error: error.message || 'Error signing in' });
      throw error;
    }
  }
  
  @Action(Logout)
  async logout({ patchState }: StateContext<AuthStateModel>) {
    patchState({ loading: true, error: null });
    try {
      await signOut();
      patchState({ user: null, identityId: null, loading: false });
    } catch (error: any) {
      patchState({ loading: false, error: error.message || 'Error signing out' });
      throw error;
    }
  }

  @Action(FetchIdentityId)
  async fetchIdentityId({ patchState }: StateContext<AuthStateModel>) {
    patchState({ loading: true, error: null });
    try {
      const session = await fetchAuthSession();
      patchState({ identityId: session?.identityId || null, loading: false });
    } catch (error: any) {
      console.error('Error getting identity ID:', error);
      patchState({ identityId: null, loading: false, error: error.message || 'Error fetching identity id' });
    }
  }

  @Action(SetAuthenticatedUser)
  setAuthenticatedUser({ patchState }: StateContext<AuthStateModel>, action: SetAuthenticatedUser) {
    patchState({ user: action.user });
  }
}