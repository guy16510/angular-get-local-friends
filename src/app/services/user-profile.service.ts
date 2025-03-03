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
  submitUserProfile(payload: UserProfile): Observable<UserProfile> {
    console.log("Sumbitting user profile via api")
    return from(
      client.mutations.mutateUserProfile({
        action: 'create',
        payload: JSON.stringify(payload),
      })
    ).pipe(
      map(result => {
        // Check for GraphQL errors and throw if any
        if (result.errors && result.errors.length > 0) {
          throw new Error('GraphQL error: ' + result.errors[0].message);
        }
        // If result.data exists, try to parse it into a UserProfile
        if (result.data) {
          try {
            const profile = JSON.parse(result.data) as UserProfile;
            return profile;
          } catch (error) {
            console.error('Error parsing API response:', error);
            // Fallback: return the original payload if parsing fails
            return payload;
          }
        }
        // Fallback: return the original payload if no data was returned
        return payload;
      })
    );
  }
}