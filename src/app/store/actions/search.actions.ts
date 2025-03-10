// src/app/store/actions/search.actions.ts
export class SearchNearbyUsers {
    static readonly type = '[Search] Nearby Users';
    constructor(
      public lat: number,
      public lng: number,
      public radius: number,
      public nextToken?: string
    ) {}
  }
  
  export class ClearSearchResults {
    static readonly type = '[Search] Clear Results';
  }