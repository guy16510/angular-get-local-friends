import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { UserProfile } from '../models/user-profile.model';

const client = generateClient<Schema>();

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  submitUserProfile(payload: UserProfile): Observable<UserProfile> {
    return from(
      client.mutations.mutateUserProfile({
        action: 'create',
        payload: JSON.stringify(payload),
      })
    ).pipe(
      map(result => {
        if (result.errors?.length) {
          throw new Error('GraphQL error: ' + result.errors.join(', '));
        }
        return result.data as UserProfile;
      })
    );
  }

  getUserProfile(identityId: string): Observable<UserProfile> {
    return from(client.queries.fetchUserProfile({ identityId })).pipe(
      map(result => {
        if (result.errors?.length) {
          throw new Error('GraphQL error: ' + result.errors.join(', '));
        }
        return result.data as UserProfile;
      })
    );
  }

  onlinePing(identityId: string): Observable<void> {
    return from(
      client.mutations.mutateUserProfile({
        action: 'onlinePing',
        payload: JSON.stringify({}),
      })
    ).pipe(
      map(result => {
        if (result.errors?.length) {
          throw new Error('GraphQL error: ' + result.errors.join(', '));
        }
      })
    );
  }

  getAnimalProfile(): Observable<{ selfProfile: any; seekingProfile: any, deepInsights: any }> {
    return from(client.queries.fetchAnimalProfile({})).pipe(
      map(result => {
        if (result.errors && result.errors.length) {
          throw new Error('GraphQL error: ' + result.errors.join(', '));
        }
        // Expect the response to include selfProfile and seekingProfile fields.
        return result.data as { selfProfile: any; seekingProfile: any, deepInsights: any };
      })
    );
  }
}