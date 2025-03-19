// auth.state.ts
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { signIn, signOut, getCurrentUser, fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { CheckAuth, Login, Logout, FetchIdentityId, SetAuthenticatedUser, SetUserProfileImage } from '../actions/auth.actions';

export interface AuthStateModel {
  user: any;
  identityId: string | null;
  loading: boolean;
  error: string | null;
  userName: string | null;
  profileImageUrl: string | null;
  cognitoId: string | null;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    identityId: null,
    cognitoId: null,
    loading: false,
    error: null,
    userName: null,
    profileImageUrl: null
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
  static profileImageUrl(state: AuthStateModel): string | null {
    return state.profileImageUrl;
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
  
  /**
   * Users Profile Image.
   */
  @Action(SetUserProfileImage)
  setUserProfileImage({ patchState }: StateContext<AuthStateModel>, action: SetUserProfileImage) {
    patchState({ profileImageUrl: action.url });
  }

  @Action(CheckAuth)
  async checkAuth({ patchState }: StateContext<AuthStateModel>) {
    patchState({ loading: true, error: null });

    try {
      const [authSession, currentUser, attributes] = await Promise.all([
        fetchAuthSession(),
        getCurrentUser(),
        fetchUserAttributes()
      ]);
      patchState({
        user: { ...currentUser, attributes },
        identityId: currentUser.userId,
        cognitoId: authSession.identityId,
        userName: attributes.nickname || null,
        loading: false,
        error: null
      });
    } catch (error: any) {
      patchState({
        user: null,
        identityId: null,
        userName: null,
        cognitoId: null,
        loading: false,
        error: error.message || 'Error checking authentication'
      });
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
}