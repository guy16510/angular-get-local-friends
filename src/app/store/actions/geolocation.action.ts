export class FetchIPLocation {
  static readonly type = '[Geolocation] Fetch IP Location';
}

export class FetchPreciseLocation {
  static readonly type = '[Geolocation] Fetch Precise Location';
}

export class FetchNominatimLocation {
  static readonly type = '[Geolocation] Fetch Nominatim Location';
  constructor(public query: string) {}
}

export class SetManualLocation {
  static readonly type = '[Geolocation] Set Manual Location';
  constructor(
    public lat: number,
    public lng: number,
    public displayName: string
  ) {}
}