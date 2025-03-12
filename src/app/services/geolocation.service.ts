import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  error$: Observable<string | null> = this.errorSubject.asObservable();

  async getCurrentPosition(options?: PositionOptions): Promise<{ lat: number; lng: number }> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        this.errorSubject.next('Geolocation is not supported by this browser.');
        this.loadingSubject.next(false);
        reject(new Error('Geolocation is not supported by this browser.'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.loadingSubject.next(false);
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          async (error) => {
            this.loadingSubject.next(false);
        
            // Retry once if it's a transient "unknown" location failure
            if (error.code === error.POSITION_UNAVAILABLE) {
              console.warn('[Geolocation] Location unknown. Retrying once...');
              try {
                const retry = await this.getCurrentPosition(options);
                resolve(retry);
                return;
              } catch (retryError) {
                this.errorSubject.next('Still unable to get location after retry.');
                reject(retryError);
                return;
              }
            }
        
            // Handle other error types
            switch (error.code) {
              case error.PERMISSION_DENIED:
                this.errorSubject.next('Location permission denied.');
                break;
              case error.TIMEOUT:
                this.errorSubject.next('Location request timed out.');
                break;
              default:
                this.errorSubject.next('Failed to get location.');
            }
            reject(error);
          },
          options
        );
      }
    });
  }

  async getIPLocation(): Promise<{ lat: number; lng: number; city?: string; region?: string }> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      this.loadingSubject.next(false);
      return {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city,
        region: data.region
      };
    } catch (error) {
      this.loadingSubject.next(false);
      this.errorSubject.next('Failed to fetch location from IP.');
      throw new Error('Failed to get IP-based location.');
    }
  }
}