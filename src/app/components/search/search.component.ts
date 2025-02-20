// src/app/components/nearby-search/search.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import { GeolocationService } from '../../services/geolocation.service';
import { LoadingComponent } from '../loading/loading.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { SearchCacheService } from '../../services/search-cache.service';
import { ImageDisplayComponent } from '../image-display/image-display.component';

const client = generateClient<Schema>();

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, MatGridListModule, MatCardModule, ImageDisplayComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  lat!: number;
  lng!: number;
  radius!: number;
  message = '';
  nearbyUsers: any[] = [];
  loading = false;

  constructor(
    private geoService: GeolocationService,
    private searchCache: SearchCacheService
  ) {}

  ngOnInit(): void {
    // Load cached search results if available
    const cachedResults1 = this.searchCache.getSearchResults();
    const cachedResults = [{"lastUpdated":"2025-02-19T02:09:24.627Z","locationLng":-71.454765,"locationLat":42.639072,"geoPrecision":7,"rangeKey":"drt4w40#f8d8478c-8c63-46b0-85f3-0dab036e6598","updatedAt":"2025-02-19T02:09:24.627Z","geohash":"drt4w40","createdAt":"2025-02-19T02:09:24.627Z","identityId":"us-east-1:660f914c-c740-cd46-7752-87ca9d0b6a6b","id":"us-east-1:660f914c-c740-cd46-7752-87ca9d0b6a6b","distance":0.06298551149750063},{"lastUpdated":"2025-02-19T02:08:29.872Z","locationLng":-71.4562031,"locationLat":42.6381061,"geoPrecision":7,"rangeKey":"drt4tfp#f66689f1-c03c-43c5-aee0-feb933a09dda","updatedAt":"2025-02-19T02:08:29.872Z","geohash":"drt4tfp","createdAt":"2025-02-19T02:08:29.872Z","identityId":"us-east-1:660f914c-c740-cd46-7752-87ca9d0b6a6c","id":"us-east-1:660f914c-c740-cd46-7752-87ca9d0b6a6c","distance":0.09021693462566867}];
    if (cachedResults.length > 0) {
      this.nearbyUsers = cachedResults;
      this.message = '';
    }
  }

  async searchUsers() {
    try {
      this.loading = true;
      
      // If cached results exist, use them instead of making a new API call
      if (this.searchCache.getSearchResults().length > 0) {
         this.nearbyUsers = this.searchCache.getSearchResults();
         return;
      }
      
      // Call the findNearbyUsers API
      const result: any = await client.queries.findNearbyUsers({
        lat: this.lat,
        lng: this.lng,
        radius: this.radius,
      });
  
      console.log("API Response:", result.data);
  
      const data = JSON.parse(result.data);
      this.nearbyUsers = Array.isArray(data.nearbyUsers) ? data.nearbyUsers : [];
      
      // Cache the results for later
      this.searchCache.setSearchResults(this.nearbyUsers);
      
      this.message = this.nearbyUsers.length ? '' : 'No users found nearby.';
    } catch (error: any) {
      console.error('Error searching nearby users:', error);
      this.message = error.message || 'An error occurred.';
    } finally {
      this.loading = false;
    }
  }

  async useCurrentLocation() {
    this.loading = true;
    try {
      const position = await this.geoService.getCurrentPosition();
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
    } catch (error: any) {
      console.error('Error getting current location:', error);
      this.message = error.message;
    }
    this.loading = false;
  }
}