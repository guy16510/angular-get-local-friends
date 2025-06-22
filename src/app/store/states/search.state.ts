import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import { SearchNearbyUsers, SearchPremiumUsers } from '../actions/search.actions';
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
    //todo add identityId to the query, or may not need to do anything?
    const result = await client.queries.findNearbyUsers({
      lat: action.lat,
      lng: action.lng,
      radius: action.radius,
      nextToken: action.nextToken || undefined,
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

      // Normalize boolean values that may be stored as numbers
      if (typeof parsedUser.hasKids === 'number') {
        parsedUser.hasKids = parsedUser.hasKids === 1;
      }
      if (typeof parsedUser.wantsFriendsWithKids === 'number') {
        parsedUser.wantsFriendsWithKids = parsedUser.wantsFriendsWithKids === 1;
      }
      if (typeof parsedUser.wantsSimilarChildAges === 'number') {
        parsedUser.wantsSimilarChildAges = parsedUser.wantsSimilarChildAges === 1;
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

  @Action(SearchPremiumUsers)
  async searchPremium(ctx: StateContext<SearchStateModel>, action: SearchPremiumUsers) {
    ctx.patchState({ loading: true });

    const surveyFilter: { questionId: number; answer: string[] }[] = [];
    if (action.filters.gender) {
      surveyFilter.push({ questionId: 3, answer: [action.filters.gender] });
    }
    if (action.filters.hasKids !== null && action.filters.hasKids !== undefined) {
      surveyFilter.push({ questionId: 5, answer: [action.filters.hasKids ? 'Yes' : 'No'] });
    }
    if (action.filters.ageRange) {
      const range = `${action.filters.ageRange.min}-${action.filters.ageRange.max}`;
      surveyFilter.push({ questionId: 1, answer: [range] });
    }

    const result = await client.queries.findPremiumMatches({
      lat: action.lat,
      lng: action.lng,
      radius: action.radius,
      surveyFilter,
      nextToken: action.nextToken || undefined,
    });

    let data: any = null;
    if (result.data) {
      try {
        data = JSON.parse(result.data as unknown as string);
      } catch (err) {
        console.error('Failed to parse premium matches response', err);
      }
    }

    const matches = (data?.premiumMatches || []) as any[];
    const parsedMatches = matches.map(u => {
      if (typeof u.hasKids === 'number') u.hasKids = u.hasKids === 1;
      if (typeof u.wantsFriendsWithKids === 'number') u.wantsFriendsWithKids = u.wantsFriendsWithKids === 1;
      if (typeof u.wantsSimilarChildAges === 'number') u.wantsSimilarChildAges = u.wantsSimilarChildAges === 1;
      return u;
    });

    ctx.patchState({
      nearbyUsers: action.nextToken ? [...ctx.getState().nearbyUsers, ...parsedMatches] : parsedMatches,
      nextToken: data?.nextToken || null,
      loading: false,
      error: null,
    });
  }
}