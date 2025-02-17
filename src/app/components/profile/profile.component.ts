import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserProfile();
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  async loadUserProfile() {
    try {
      this.loading = true;
      this.user = await this.authService.getUserInfo();
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
