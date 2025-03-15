import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import { SearchNearbyUsers } from '../actions/search.actions';
import { SearchStateModel } from '../../models/Search';
import { AuthState } from './auth.state';

const client = generateClient<Schema>({
  authMode: 'userPool'
});

interface NearbyUsersPayload {
  success: boolean;
  nearbyUsers: any[];
  nextToken?: string | null;
  error: string | null;
}

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
  
  constructor(
    private store: Store
  ) {}

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
    const identityId = this.store.selectSnapshot(AuthState.identityId);
  
    ctx.patchState({ loading: true });
    debugger;
    const result = await client.queries.findNearbyUsers({
      lat: action.lat,
      lng: action.lng,
      radius: action.radius,
      nextToken: action.nextToken || undefined,
      identityId: identityId
    });
  
    const rawData = result.data as NearbyUsersPayload | null;

    if (!rawData || !rawData.success) {
      ctx.patchState({ 
        error: rawData?.error || 'Failed to retrieve nearby users.',
        loading: false
      });
      console.error('[SearchState] Error fetching nearby users:', rawData?.error);
      return;
    }
  
    const parsedNearbyUsers = rawData.nearbyUsers.map((user: string | any) => {
      if (typeof user === 'string') {
        try {
          return JSON.parse(user);
        } catch (e) {
          console.error("Failed to parse user:", user);
          return null;
        }
      }
      return user;
    }).filter(Boolean);
  
    ctx.patchState({
      nearbyUsers: action.nextToken
        ? [...ctx.getState().nearbyUsers, ...parsedNearbyUsers]
        : parsedNearbyUsers,
      nextToken: rawData.nextToken || null,
      loading: false,
      error: null
    });
  }
}