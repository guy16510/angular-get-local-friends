// src/app/store/states/search.state.ts
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import { SearchNearbyUsers } from '../actions/search.actions';
import { SearchStateModel } from '../../models/Search';

const client = generateClient<Schema>();

@State<SearchStateModel>({
  name: 'search',
  defaults: {
    nearbyUsers: [],
    loading: false,
    error: null,
    nextToken: null
  }
})
@Injectable()
export class SearchState {
  @Selector() static nearbyUsers(state: SearchStateModel) {
    return state.nearbyUsers;
  }

  @Selector() static loading(state: SearchStateModel) {
    return state.loading;
  }

  @Selector() static error(state: SearchStateModel) {
    return state.error;
  }

  @Selector() static nextToken(state: SearchStateModel) {
    return state.nextToken;
  }
  
  @Selector()
  static getUserById(state: SearchStateModel): (identityId: string) => any | undefined {
    return (identityId: string) => state.nearbyUsers.find(user => user.identityId === identityId);
  }

  @Action(SearchNearbyUsers)
  async search(ctx: StateContext<SearchStateModel>, action: SearchNearbyUsers) {
    ctx.patchState({ loading: true, error: null });

    try {
      const result = await client.queries.findNearbyUsers({
        lat: action.lat,
        lng: action.lng,
        radius: action.radius,
        nextToken: action.nextToken || undefined,
      });

      const data = JSON.parse(result.data || '{}');

      ctx.patchState({
        nearbyUsers: action.nextToken
          ? [...ctx.getState().nearbyUsers, ...data.nearbyUsers]
          : data.nearbyUsers,
        nextToken: data.nextToken || null,
        loading: false,
      });
    } catch (error: any) {
      ctx.patchState({ error: error.message, loading: false });
    }
  }
}