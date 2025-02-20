import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../../../amplify/data/resource';

const client = generateClient<Schema>();

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  error: string | null = null;
  userProfile: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserProfile();
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  async getUserProfile(userId: string) {
    const result: any = await client.queries.fetchUserProfile({
      userId: userId
    });
    // Assuming your backend returns a JSON string, parse it
    this.userProfile = JSON.parse(result.data);
  }

  async loadUserProfile() {
    try {
      this.loading = true;
      this.user = await this.authService.getUserInfo();
      await this.getUserProfile(this.user.userId);
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
