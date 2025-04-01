import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

@Injectable({
  providedIn: 'root'
})
export class PremiumService {
  enrollPremium(): Observable<any> {
    return from(client.mutations.enrollPremium()).pipe(
      map(response => {
        if (response.errors?.length) {
          throw new Error('GraphQL error: ' + response.errors.join(', '));
        }
        return response.data;
      })
    );
  }

  removePremium(): Observable<any> {
    return from(client.mutations.removePremium()).pipe(
      map(response => {
        if (response.errors?.length) {
          throw new Error('GraphQL error: ' + response.errors.join(', '));
        }
        return response.data;
      })
    );
  }
} 