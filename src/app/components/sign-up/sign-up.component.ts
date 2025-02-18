import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';

const client = generateClient<Schema>();

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {
  userId = '';
  locationLat!: number;
  locationLng!: number;
  message = '';

  async signUp() {
    try {
      // Build a JSON-encoded payload with the required fields.
      const payload = JSON.stringify({
        userId: this.userId,
        locationLat: Number(this.locationLat),
        locationLng: Number(this.locationLng),
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
  }
}