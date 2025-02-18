// src/app/components/nearby-search/search.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import { GeolocationService } from '../../services/geolocation.service';
import { LoadingComponent } from '../loading/loading.component';

const client = generateClient<Schema>();

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  lat!: number;
  lng!: number;
  radius!: number;
  message = '';
  nearbyUsers: any[] = [];
  loading = false;

  constructor(private geoService: GeolocationService) {}

  async searchUsers() {
    try {
      this.loading = true;
      // Call the findNearbyUsers function. Note that it returns a JSON string.
      const result: any = await client.queries.findNearbyUsers({
        lat: this.lat,
        lng: this.lng,
        radius: this.radius,
      });
      const data = JSON.parse(result);
      this.nearbyUsers = data.nearbyUsers;
      this.message = this.nearbyUsers.length ? '' : 'No users found nearby.';
    } catch (error: any) {
      console.error('Error searching nearby users:', error);
      this.message = error.message;
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