// src/app/store/models/search.model.ts
export interface NearbyUser {
    identityId: string;
    distance: number;
    locationLat: number;
    locationLng: number;
    lastUpdated: string;
  }
  
  export interface SearchStateModel {
    nearbyUsers: NearbyUser[];
    loading: boolean;
    error: string | null;
    nextToken: string | null;
  }