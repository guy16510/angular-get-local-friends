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
  
  generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async signUp() {
    this.loading = true;
    try {
      // Build a JSON-encoded payload with the required fields.
      const payload = JSON.stringify({
        // userId: this.userId,
        userId: this.generateGUID(),
        locationLat: Number(this.lat),
        locationLng: Number(this.lng),
      });
      // Call the mutateUserProfile function with the "create" action.
      const result: any = await client.mutations.mutateUserProfile({
        action: 'create',
        payload,
      });
      this.message = result.data;
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