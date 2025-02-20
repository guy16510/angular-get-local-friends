import { Injectable } from '@angular/core';
import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    this.checkAuthStatus();
  }

  async checkAuthStatus() {
    try {
      const currentUser = await getCurrentUser();
      this.userSubject.next(currentUser);
    } catch (error) {
      this.userSubject.next(null);
    }
  }

  async login(username: string, password: string) {
    try {
      const signInResult = await signIn({ username, password });
      await this.checkAuthStatus();
      return signInResult;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut();
      this.userSubject.next(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async getUserInfo() {
    try {
      const currentUser = await getCurrentUser();
      return {
        username: currentUser.username,
        userId: currentUser.userId, // from the User Pool
        signInDetails: currentUser.signInDetails
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  async getIdentityId(): Promise<any> {
    try {
      const session = await fetchAuthSession();
      debugger;
      return session.identityId;
    } catch (error) {
      console.error('Error getting identity ID:', error);
      return null;
    }
  }
}