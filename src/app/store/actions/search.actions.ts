// src/app/store/actions/search.actions.ts
export class SearchNearbyUsers {
    static readonly type = '[Search] Search Nearby Users';
    constructor(
      public lat: number,
      public lng: number,
      public radius: number,
      public nextToken?: string
    ) {}
  }
  
  export class SearchUsers {
    static readonly type = '[Search] Search Users';
    constructor(public filters: {
      radius: number;
      sortBy: string;
      gender?: string | null;
      hasKids?: boolean | null;
      ageRange?: {
        min: number;
        max: number;
      };
    }) {}
  }
  
  export class SetSearchFilters {
    static readonly type = '[Search] Set Search Filters';
    constructor(public filters: {
      radius: number;
      sortBy: string;
      gender?: string | null;
      hasKids?: boolean | null;
      ageRange?: {
        min: number;
        max: number;
      };
    }) {}
  }
  
  export class ClearSearchResults {
    static readonly type = '[Search] Clear Results';
  }