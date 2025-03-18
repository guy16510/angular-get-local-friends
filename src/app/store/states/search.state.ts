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
      let parsedUser: any;

      if (typeof user === 'string') {
        try {
          parsedUser = JSON.parse(user);
        } catch (e) {
          console.error('❌ Failed to parse user JSON:', user);
          return null;
        }
      } else {
        parsedUser = user;
      }

      // 🔥 Parse nested `surveyAnswers` field if it's still stringified
      if (typeof parsedUser?.surveyAnswers === 'string') {
        try {
          parsedUser.surveyAnswers = JSON.parse(parsedUser.surveyAnswers);
        } catch (err) {
          console.warn('⚠️ Failed to parse nested surveyAnswers:', parsedUser.surveyAnswers);
          parsedUser.surveyAnswers = [];
        }
      }

      // 🔥 Parse nested `images` field if it's still stringified
      if (typeof parsedUser?.images === 'string') {
        try {
          parsedUser.images = JSON.parse(parsedUser.images);
        } catch (err) {
          parsedUser.images = [];
        }
      }

      return parsedUser;
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