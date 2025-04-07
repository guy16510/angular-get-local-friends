import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { GeolocationService } from '../../services/geolocation.service';
import { 
  FetchIPLocation, 
  FetchPreciseLocation, 
  FetchNominatimLocation, 
  SetManualLocation 
} from '../../store/actions/geolocation.action';
import { GeolocationStateModel } from '../../models/GeoLocation';

@State<GeolocationStateModel>({
  name: 'geolocation',
  defaults: {
    lat: null,
    lng: null,
    city: null,
    region: null,
    preciseLocationGranted: false,
    loading: false,
    error: null,
    // New property to store fallback locations from Nominatim
    fallbackLocations: []
  }
})
@Injectable()
export class GeolocationState {
  constructor(private geoService: GeolocationService) {}

  @Selector()
  static location(state: GeolocationStateModel) {
    return { lat: state.lat, lng: state.lng, city: state.city };
  }

  @Selector()
  static loading(state: GeolocationStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: GeolocationStateModel): string | null {
    return state.error;
  }

  @Selector()
  static preciseLocationGranted(state: GeolocationStateModel): boolean {
    return state.preciseLocationGranted;
  }

  @Selector()
  static fallbackLocations(state: GeolocationStateModel) {
    return state.fallbackLocations;
  }

  @Action(FetchIPLocation)
  async fetchIPLocation({ patchState }: StateContext<GeolocationStateModel>) {
    patchState({ loading: true, error: null });
    try {
      const location = await this.geoService.getIPLocation();
      patchState({
        lat: location.lat,
        lng: location.lng,
        city: location.city || null,
        region: location.region || null,
        loading: false,
        error: null
      });
      return location;
    } catch (error: any) {
      patchState({ 
        loading: false,
        error: error.message || 'Failed to get IP location'
      });
      throw error;
    }
  }

  @Action(FetchPreciseLocation)
  async fetchPreciseLocation({ patchState, dispatch, getState }: StateContext<GeolocationStateModel>) {
    patchState({ loading: true, error: null });
    try {
      const position = await this.geoService.getCurrentPosition();
      const currentState = getState();
      patchState({
        lat: position.lat,
        lng: position.lng,
        city: currentState.city, // preserve existing city info if any
        preciseLocationGranted: true,
        loading: false,
        error: null,
        fallbackLocations: [] // clear any fallback options
      });
      return position;
    } catch (error: any) {
      patchState({ loading: false, error: error.message || 'Failed to get precise location' });
      // If precise lookup fails, try IP-based lookup as a fallback.
      try {
        return await dispatch(new FetchIPLocation()).toPromise();
      } catch (ipError: any) {
        // Let manual fallback be triggered in the component.
        throw ipError;
      }
    }
  }

  @Action(FetchNominatimLocation)
  async fetchNominatimLocation({ patchState }: StateContext<GeolocationStateModel>, action: FetchNominatimLocation) {
    patchState({ loading: true, error: null });
    try {
      const locations = await this.geoService.getNominatimLocations(action.query);
      patchState({
        fallbackLocations: locations,
        loading: false,
        error: null
      });
      return locations;
    } catch (error: any) {
      patchState({ 
        loading: false,
        error: error.message || 'Failed to get fallback location from Nominatim'
      });
      throw error;
    }
  }

  @Action(SetManualLocation)
  setManualLocation({ patchState }: StateContext<GeolocationStateModel>, action: SetManualLocation) {
    patchState({
      lat: action.lat,
      lng: action.lng,
      city: action.displayName, // Use displayName as the city/region placeholder
      preciseLocationGranted: false,
      fallbackLocations: [] // Clear fallback options on manual selection
    });
    return { lat: action.lat, lng: action.lng, displayName: action.displayName };
  }
}