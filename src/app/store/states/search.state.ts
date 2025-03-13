import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import { SearchNearbyUsers } from '../actions/search.actions';
import { SearchStateModel } from '../../models/Search';

const client = generateClient<Schema>();

interface NearbyUsersPayload {
  success: boolean;
  nearbyUsers: any[];
  nextToken?: string | null;
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
  
      const rawData = result?.data as NearbyUsersPayload | null;
      if (!rawData) {
        throw new Error('No data received');
      }
  
      // Parse nearbyUsers: if an element is a string, JSON.parse it.
      const parsedNearbyUsers = Array.isArray(rawData.nearbyUsers)
        ? rawData.nearbyUsers.map(user => {
            if (typeof user === 'string') {
              try {
                return JSON.parse(user);
              } catch (parseError) {
                console.error("Failed to parse user:", user);
                return null;
              }
            }
            return user;
          }).filter(user => user !== null)
        : [];
  
      ctx.patchState({
        nearbyUsers: action.nextToken
          ? [...ctx.getState().nearbyUsers, ...parsedNearbyUsers]
          : parsedNearbyUsers,
        nextToken: rawData.nextToken || null,
        loading: false,
      });
    } catch (error: any) {
      ctx.patchState({ error: error.message, loading: false });
    }
  }
}