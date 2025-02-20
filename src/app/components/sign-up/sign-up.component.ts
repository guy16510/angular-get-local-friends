import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { generateClient } from 'aws-amplify/data';
import { GeolocationService } from '../../services/geolocation.service';
import type { Schema } from '../../../../amplify/data/resource';
import { LoadingComponent } from '../loading/loading.component';
import {AuthService} from '../../services/auth.service'

const client = generateClient<Schema>();

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LoadingComponent
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  loading = false;
  identityId = '';
  lat!: number;
  lng!: number;
  message = '';

  constructor(private geoService: GeolocationService, private authService: AuthService) {}

  async ngOnInit() {
    this.identityId = await this.authService.getIdentityId();
  }

  // generateGUID() {
  //   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
  //     const r = (Math.random() * 16) | 0;
  //     const v = c === 'x' ? r : (r & 0x3) | 0x8;
  //     return v.toString(16);
  //   });
  // }

  async signUp() {
    this.loading = true;
    try {
      const payload = JSON.stringify({
        identityId: this.identityId,
        locationLat: Number(this.lat),
        locationLng: Number(this.lng),
      });
  
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