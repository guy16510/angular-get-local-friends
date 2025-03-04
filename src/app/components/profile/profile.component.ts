import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, first } from 'rxjs';
import { AuthState } from '../../store/states/auth.state';
import { CheckAuth, FetchIdentityId } from '../../store/actions/auth.actions';
import { FileService } from '../../services/file.service';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../../../amplify/data/resource';
import { UploadComponent } from '../image-upload/image-upload.component';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../loading/loading.component';

const client = generateClient<Schema>();

@Component({
    selector: 'app-profile',
    imports: [
        CommonModule,
        RouterModule,
        UploadComponent,
        LoadingComponent,
        MatCardModule,
        MatButtonModule,
        MatListModule,
        MatIconModule
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // Use the new inject(Store) method to set up selectors.
  private store = inject(Store);
  identityId$: Observable<string | null> = this.store.select(AuthState.identityId);
  loading$: Observable<boolean> = this.store.select(AuthState.loading);
  error$: Observable<string | null> = this.store.select(AuthState.error);
  user$: Observable<any> = this.store.select(AuthState.user);

  identityId: string | null = null;
  userProfile: Record<string, any> | null = null;
  profileImage: string = '/assets/images/noImageUploaded.jpg';
  loading = true;
  error: string | null = null;

  constructor(private fileService: FileService) {}

  ngOnInit() {
    // One-time check: if identityId is missing, dispatch CheckAuth and FetchIdentityId.
    this.identityId$
      .pipe(first())
      .subscribe((id) => {
        if (!id) {
          console.log('[ProfileComponent] identityId is null; dispatching CheckAuth and FetchIdentityId');
          this.store.dispatch(new CheckAuth());
          this.store.dispatch(new FetchIdentityId());
        }
      });

    // Subscribe to identityId changes.
    this.identityId$.subscribe((id) => {
      console.log('[ProfileComponent] identityId from store:', id);
      this.identityId = id;
      if (this.identityId) {
        this.loadUserProfile();
      }
    });

    // Subscribe to loading and error state.
    this.loading$.subscribe((load) => (this.loading = load));
    this.error$.subscribe((err) => (this.error = err));
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
      if (!this.identityId) {
        throw new Error('Identity ID not found');
      }
      await this.getUserProfile(this.identityId);
      // Fetch user profile image.
      const imgSrc = await this.fileService.getUserImage(this.identityId);
      if (imgSrc) {
        this.profileImage = imgSrc;
      }
      this.error = null;
    } catch (error) {
      console.error(error);
      this.error = 'Failed to load user profile';
    }
  }
}