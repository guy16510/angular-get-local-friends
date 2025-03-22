import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserProfile } from '../../models/user-profile.model';
import { UserProfileState } from '../../store/states/user-profile.state';
import { LoadAnimalProfile, LoadUserProfile, SubmitUserProfile } from '../../store/actions/user-profile.actions';
import { MaterialModule } from '../../shared/material.module';
import { UploadComponent } from '../image-upload/image-upload.component';
import { LoadingComponent } from '../shared/loading/loading.component';
import { CommonModule } from '@angular/common';
import { AuthState } from '../../store/states/auth.state';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
  imports: [MaterialModule, UploadComponent, LoadingComponent, CommonModule],
  standalone: true
})
export class MyProfileComponent implements OnInit {
  @Select(UserProfileState.profile) userProfile$!: Observable<UserProfile | null>;
  @Select(UserProfileState.loading) loading$!: Observable<boolean>;
  @Select(UserProfileState.error) error$!: Observable<string | null>;
  @Select(UserProfileState.getSeekingProfile) seekingProfile$!: Observable<string | null>;
  @Select(UserProfileState.getSelfProfile) selfProfile$!: Observable<string | null>;

  profileImage: string = '/assets/images/noImageUploaded.jpg';
  objectKeys = Object.keys; // Expose Object.keys for the template

  // Parsed profile properties (if the API returns JSON strings)
  parsedSelfProfile: any = null;
  parsedSeekingProfile: any = null;

  private store = inject(Store);

  @ViewChild('uploadComponent') uploadComponent!: UploadComponent;

  constructor(private fileService: FileService) {}

  async ngOnInit(): Promise<void> {
    this.store.dispatch(new LoadUserProfile());
    await this.loadUserProfile();

    // Subscribe to userProfile and parse animal profile JSON if needed
    this.userProfile$.subscribe(userProfile => {
      if (userProfile) {
        // For selfProfile
        if (userProfile.selfProfile) {
          if (typeof userProfile.selfProfile === 'string') {
            try {
              this.parsedSelfProfile = JSON.parse(userProfile.selfProfile);
            } catch (e) {
              console.error("Error parsing selfProfile", e);
              this.parsedSelfProfile = null;
            }
          } else {
            this.parsedSelfProfile = userProfile.selfProfile;
          }
        }
        // For seekingProfile
        if (userProfile.seekingProfile) {
          if (typeof userProfile.seekingProfile === 'string') {
            try {
              this.parsedSeekingProfile = JSON.parse(userProfile.seekingProfile);
            } catch (e) {
              console.error("Error parsing seekingProfile", e);
              this.parsedSeekingProfile = null;
            }
          } else {
            this.parsedSeekingProfile = userProfile.seekingProfile;
          }
        }
      }
    });
  }

  onSubmit(updatedProfile: UserProfile): void {
    this.store.dispatch(new SubmitUserProfile(updatedProfile));
  }

  async loadUserProfile() {
    try {
      const identityId = this.store.selectSnapshot(AuthState.identityId) || '';
      const imgSrc = await this.fileService.getUserImage(identityId);
      if (imgSrc) {
        this.profileImage = imgSrc;
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Trigger the file input in the hidden upload component.
  triggerEdit(): void {
    this.uploadComponent.triggerFileInput();
  }

  // Update the profile image once the upload component notifies us.
  onImageUpdated(newImage: string): void {
    this.profileImage = newImage;
  }

  viewAnimalProfile(): void {
    this.store.dispatch(new LoadAnimalProfile());
  }
}