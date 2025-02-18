import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';

const client = generateClient<Schema>();


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  lat!: number;
  lng!: number;
  radius!: number;
  message = '';
  nearbyUsers: any[] = [];

  async searchUsers() {
    try {
      // Call the findNearbyUsers function. Note that it returns a JSON string.
      const result: any = await client.queries.findNearbyUsers({
        lat: this.lat,
        lng: this.lng,
        radius: this.radius,
      });
      const data = JSON.parse(result)
      this.nearbyUsers = data.nearbyUsers;
      this.message = this.nearbyUsers.length ? '' : 'No users found nearby.';
    } catch (error: any) {
      console.error('Error searching nearby users:', error);
      this.message = error.message;
    }
  }
}