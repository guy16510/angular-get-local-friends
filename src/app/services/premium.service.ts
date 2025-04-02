import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

interface PremiumResponse {
  data: string;
  extensions?: any;
}

const client = generateClient<Schema>();

@Injectable({
  providedIn: 'root'
})
export class PremiumService {
  enrollPremium(): Observable<any> {
    return from(client.mutations.enrollPremium()).pipe(
      map(response => {
        console.log('Raw enrollPremium response:', response);
        
        const premiumResponse = response as PremiumResponse;
        if (!premiumResponse) {
          throw new Error('Server did not respond');
        }

        if (!premiumResponse.data) {
          throw new Error('Server returned no data');
        }

        let parsedResponse;
        try {
          parsedResponse = JSON.parse(premiumResponse.data);
        } catch (err) {
          console.error('Failed to parse enrollPremium response:', premiumResponse.data, err);
          throw new Error('Server returned invalid data');
        }

        if (parsedResponse.statusCode === 500) {
          let errorMessage;
          try {
            const errorBody = JSON.parse(parsedResponse.body);
            errorMessage = errorBody.message || 'Server error occurred';
          } catch (err) {
            errorMessage = 'Server error occurred';
          }
          throw new Error(errorMessage);
        }

        return parsedResponse;
      }),
      catchError(error => {
        console.error('Premium enrollment error:', error);
        return throwError(() => error);
      })
    );
  }

  removePremium(): Observable<any> {
    return from(client.mutations.removePremium()).pipe(
      map(response => {
        console.log('Raw removePremium response:', response);
        
        const premiumResponse = response as PremiumResponse;
        if (!premiumResponse) {
          throw new Error('Server did not respond');
        }

        if (!premiumResponse.data) {
          throw new Error('Server returned no data');
        }

        let parsedResponse;
        try {
          parsedResponse = JSON.parse(premiumResponse.data);
        } catch (err) {
          console.error('Failed to parse removePremium response:', premiumResponse.data, err);
          throw new Error('Server returned invalid data');
        }

        if (parsedResponse.statusCode === 500) {
          let errorMessage;
          try {
            const errorBody = JSON.parse(parsedResponse.body);
            errorMessage = errorBody.message || 'Server error occurred';
          } catch (err) {
            errorMessage = 'Server error occurred';
          }
          throw new Error(errorMessage);
        }

        return parsedResponse;
      }),
      catchError(error => {
        console.error('Premium removal error:', error);
        return throwError(() => error);
      })
    );
  }
} 