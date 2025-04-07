export interface GeolocationStateModel {
  lat: number | null;
  lng: number | null;
  city: string | null;
  region: string | null;
  preciseLocationGranted: boolean;
  loading: boolean;
  error: string | null;
  // New field to store fallback results from Nominatim
  fallbackLocations?: Array<{ lat: number; lng: number; displayName: string }>;
}