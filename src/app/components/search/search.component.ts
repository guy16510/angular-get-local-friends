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

const client = generateClient<Schema>();

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, MatGridListModule, MatCardModule],
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
    const cachedResults = this.searchCache.getSearchResults();
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