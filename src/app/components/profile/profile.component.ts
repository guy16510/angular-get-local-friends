import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FileService } from '../../services/file.service';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../../../amplify/data/resource';
import { UploadComponent } from '../image-upload/image-upload.component';

// ✅ Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../loading/loading.component';

const client = generateClient<Schema>();

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UploadComponent,
    LoadingComponent,
    // ✅ Material Modules
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userProfile: Record<string, any> | null = null;
  identityId: string | null = null;
  profileImage: string = '/assets/images/noImageUploaded.jpg';
  loading = true;
  error: string | null = null;

  constructor(private authService: AuthService, private fileService: FileService) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  async getUserProfile(identityId: string) {
    try {
      const result: any = await client.queries.fetchUserProfile({ identityId });
      this.userProfile = JSON.parse(result.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      this.error = 'Failed to load user profile';
    }
  }

  async loadUserProfile() {
    try {
      this.loading = true;
      this.identityId = await this.authService.getIdentityId();
      if (!this.identityId) {
        throw new Error('Identity ID not found');
      }

      await this.getUserProfile(this.identityId);

      // ✅ Fetch user profile image
      const imgSrc = await this.fileService.getUserImage(this.identityId);
      if (imgSrc) {
        this.profileImage = imgSrc;
      }

      this.error = null;
    } catch (error) {
      this.error = 'Failed to load user profile';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  async signOut() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}