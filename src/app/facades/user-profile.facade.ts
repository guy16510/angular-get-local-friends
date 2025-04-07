import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthState } from '../store/states/auth.state';
import { UserProfileState } from '../store/states/user-profile.state';
import { LoadUserProfile } from '../store/actions/user-profile.actions';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileFacade {
  constructor(private store: Store) {}

  getCurrentUserProfile(): Observable<UserProfile | null> {
    const identityId = this.store.selectSnapshot(AuthState.identityId);
    if (!identityId) {
      return of(null);
    }
    const existingProfile = this.store.selectSnapshot(UserProfileState.getProfileById)(identityId);
    if (!existingProfile) {
      // Dispatch load if profile is not already loaded
      this.store.dispatch(new LoadUserProfile(identityId));
    }
    return this.store.select(UserProfileState.getProfileById).pipe(
      map(getById => getById(identityId))
    );
  }
}