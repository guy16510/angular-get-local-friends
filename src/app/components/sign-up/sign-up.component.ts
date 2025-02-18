import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateClient } from 'aws-amplify/data';
import { GeolocationService } from '../../services/geolocation.service';
import type { Schema } from '../../../../amplify/data/resource';
import { LoadingComponent } from '../loading/loading.component';

const client = generateClient<Schema>();

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {
  loading = false;
  userId = '';
  lat!: number;
  lng!: number;
  message = '';
  
  constructor(private geoService: GeolocationService) {}
  

  async signUp() {
    this.loading = true;
    try {
      // Build a JSON-encoded payload with the required fields.
      const payload = JSON.stringify({
        // userId: this.userId,
        userId: 'b4c82498-1031-70e1-976b-d6da3060b5fd',
        locationLat: Number(this.lat),
        locationLng: Number(this.lng),
      });
      // Call the mutateUserProfile function with the "create" action.
      const result: any = await client.mutations.mutateUserProfile({
        action: 'create',
        payload,
      });
      this.message = result;
    } catch (error: any) {
      console.error('Error signing up:', error);
      this.message = error.message;
    }
    this.loading = false;
  }

  async useCurrentLocation() {
    try {
      const position = await this.geoService.getCurrentPosition();
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
    } catch (error: any) {
      console.error('Error getting current location:', error);
      this.message = error.message;
    }
  }
}