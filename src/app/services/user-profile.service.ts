import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { UserProfile } from '../models/user-profile.model';

const client = generateClient<Schema>();

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  /**
   * Submits the user profile using AWS Amplify.
   * @param payload The user profile data to submit.
   * @returns An Observable emitting the UserProfile returned by the API.
   */
  submitUserProfile(payload: UserProfile): Observable<any> {
    console.log("Submitting user profile via API");
    return from(
      client.mutations.mutateUserProfile({
        action: 'create',
        payload: JSON.stringify(payload),
      })
    ).pipe(
      map(result => {
        if (result.errors && result.errors.length > 0) {
          throw new Error('GraphQL error: ' + result.errors[0].message);
        }
        if (result.data) {
          try {
            return result.data;
          } catch (error) {
            console.error('Error parsing API response:', error);
            return payload;
          }
        }
        return payload;
      })
    );
  }

  /**
   * Updates the user's last online timestamp.
   * @param identityId The Cognito identity ID of the user.
   * @returns Observable indicating completion or error.
   */
  updateUserOnlineStatus(identityId: string): Observable<any> {
    const payload = { identityId };
    return from(
      client.mutations.mutateUserProfile({
        action: 'onlinePing',
        payload: JSON.stringify(payload),
      })
    ).pipe(
      map(result => {
        if (result.errors && result.errors.length > 0) {
          throw new Error('GraphQL error: ' + result.errors[0].message);
        }
        return result.data || {};
      })
    );
  }
}