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
    return state.lat === null && state.lng === null;
  }

  @Selector()
  static error(state: GeolocationStateModel): string | null {
    return state.lat && state.lng ? null : state.city;
  }

  @Action(FetchIPLocation)
  async fetchIPLocation({ patchState }: StateContext<GeolocationStateModel>) {
    try {
      const location = await this.geoService.getIPLocation();
      patchState({
        lat: location.lat,
        lng: location.lng,
        city: location.city || null
      });
    } catch (error: any) {
      patchState({ error: error.message });
    }
  }

  @Action(FetchPreciseLocation)
  async fetchPreciseLocation({ patchState }: StateContext<GeolocationStateModel>) {
    try {
      const position = await this.geoService.getCurrentPosition();
      patchState({
        lat: position.lat,
        lng: position.lng,
        city: null
      });
    } catch (error: any) {
      patchState({ error: error.message });
    }
  }
}