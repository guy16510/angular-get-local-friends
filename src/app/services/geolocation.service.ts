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
              enableHighAccuracy: true,
            });
          });
          this.loadingSubject.next(false);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        } catch (error: any) {
          // Retry for POSITION_UNAVAILABLE or known CoreLocation errors
          if (
            error.code === error.POSITION_UNAVAILABLE ||
            (error.message && error.message.includes('kCLErrorLocationUnknown'))
          ) {
            if (attempt < this.MAX_RETRIES) {
              console.warn(`[Geolocation] Location unavailable. Attempt ${attempt}/${this.MAX_RETRIES}. Retrying...`);
              await new Promise(res => setTimeout(res, this.RETRY_DELAY));
              await attemptGetLocation(attempt + 1);
              return;
            }
          }
          // For PERMISSION_DENIED, prompt user with benefits and fallback
          if (error.code === error.PERMISSION_DENIED) {
            console.warn('Location permission denied. Falling back to IP-based location.');
            try {
              const ipLocation = await this.getIPLocation();
              resolve(ipLocation);
              return;
            } catch (ipError) {
              this.errorSubject.next(
                'Location permission denied. Precise location improves your matches by connecting you with nearby friends. Please enable location services in your browser.'
              );
              this.loadingSubject.next(false);
              reject(error);
              return;
            }
          }
          // For TIMEOUT errors, don't retry automatically.
          if (error.code === error.TIMEOUT) {
            this.errorSubject.next('Location request timed out. Please check your internet connection.');
            this.loadingSubject.next(false);
            reject(error);
            return;
          }
          // For POSITION_UNAVAILABLE after retries, fall back to IP location.
          if (error.code === error.POSITION_UNAVAILABLE) {
            this.errorSubject.next('Location information is unavailable. Falling back to IP-based location.');
            try {
              const ipLocation = await this.getIPLocation();
              resolve(ipLocation);
              return;
            } catch (ipError) {
              this.errorSubject.next('Both GPS and IP-based location failed.');
              this.loadingSubject.next(false);
              reject(error);
              return;
            }
          }
          // Default error handling
          this.errorSubject.next('Failed to get location. Please try again later.');
          this.loadingSubject.next(false);
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
        region: data.region,
      };
    } catch (error) {
      this.loadingSubject.next(false);
      this.errorSubject.next('Failed to fetch location from IP.');
      throw new Error('Failed to get IP-based location.');
    }
  }
  // geolocation.service.ts
async getNominatimLocations(query: string): Promise<Array<{ lat: number; lng: number; displayName: string }>> {
  this.loadingSubject.next(true);
  this.errorSubject.next(null);
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Nominatim HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    this.loadingSubject.next(false);
    // Map response items to a simpler location object
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name
    }));
  } catch (error) {
    this.loadingSubject.next(false);
    this.errorSubject.next('Failed to fetch location from Nominatim.');
    throw new Error('Failed to fetch location from Nominatim.');
  }
}
}