import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { GeolocationService } from '../../services/geolocation.service';
import { FetchPreciseLocation, FetchIPLocation } from '../../store/actions/geolocation.action';
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
    error: null
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

  @Action(FetchIPLocation)
  async fetchIPLocation({ patchState }: StateContext<GeolocationStateModel>) {
    patchState({ loading: true, error: null });
    debugger;
    try {
      const location = await this.geoService.getIPLocation();
      patchState({
        lat: location.lat,
        lng: location.lng,
        city: location.city || null,
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
        city: currentState.city,
        preciseLocationGranted: true,
        loading: false,
        error: null
      });
      return position;
    } catch (error: any) {
      patchState({ 
        loading: false,
        error: error.message || 'Failed to get precise location'
      });
      // If precise location fails, try IP location as fallback
      try {
        return await dispatch(new FetchIPLocation()).toPromise();
      } catch (ipError: any) {
        patchState({ 
          error: `Precise location failed: ${error.message}. IP fallback failed: ${ipError.message}`
        });
        throw ipError;
      }
    }
  }
}