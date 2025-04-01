import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

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
        return;
      }

      const attemptGetLocation = async (attempt: number = 1): Promise<void> => {
        try {
          const position = await new Promise<GeolocationPosition>((resolvePosition, rejectPosition) => {
            navigator.geolocation.getCurrentPosition(resolvePosition, rejectPosition, {
              ...options,
              timeout: 10000, // 10 second timeout
              enableHighAccuracy: true
            });
          });

          this.loadingSubject.next(false);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        } catch (error: any) {
          // Handle CoreLocation specific error
          if (error.code === error.POSITION_UNAVAILABLE || 
              (error.message && error.message.includes('kCLErrorLocationUnknown'))) {
            if (attempt < this.MAX_RETRIES) {
              console.warn(`[Geolocation] Location unknown. Attempt ${attempt}/${this.MAX_RETRIES}. Retrying...`);
              await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
              await attemptGetLocation(attempt + 1);
              return;
            }
          }

          // Handle other error types
          this.loadingSubject.next(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              this.errorSubject.next('Location permission denied. Please enable location services in your device settings.');
              break;
            case error.TIMEOUT:
              this.errorSubject.next('Location request timed out. Please check your internet connection.');
              break;
            case error.POSITION_UNAVAILABLE:
              this.errorSubject.next('Location information is unavailable. Falling back to IP-based location.');
              // Try IP-based location as fallback
              try {
                const ipLocation = await this.getIPLocation();
                resolve(ipLocation);
                return;
              } catch (ipError) {
                this.errorSubject.next('Both GPS and IP-based location failed.');
                break;
              }
            default:
              this.errorSubject.next('Failed to get location. Please try again later.');
          }
          reject(error);
        }
      };

      attemptGetLocation();
    });
  }

  async getIPLocation(): Promise<{ lat: number; lng: number; city?: string; region?: string }> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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