// import 'aws-amplify/auth/enable-oauth-listener';
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
import { CheckAuth } from '../../store/actions/auth.actions';
import { Router } from '@angular/router';

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

  profileImage: string = '/assets/images/noImageUploaded.jpg';
  private store = inject(Store);

  @ViewChild('uploadComponent') uploadComponent!: UploadComponent;

  constructor(private fileService: FileService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    await this.store.dispatch(new CheckAuth());

    this.store.dispatch(new LoadUserProfile());
    await this.loadUserProfile();
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
      } else {
        this.profileImage = '/assets/images/noImageUploaded.jpg';
      }
    } catch (error) {
      console.error(error);
      this.profileImage = '/assets/images/noImageUploaded.jpg';
    }
  }

  triggerEdit(): void {
    this.uploadComponent.triggerFileInput();
  }

  onImageUpdated(newImage: string): void {
    this.profileImage = newImage;
  }

  viewAnimalProfile(): void {
    this.store.dispatch(new LoadAnimalProfile());
  }

  getDeepInsights(userProfile: UserProfile | null) {
    return userProfile?.deepInsights ?? null;
  }

  getSelfAnimalImage(userProfile: UserProfile | null): string | null {
    return userProfile?.selfProfile?.animal ? `/assets/images/animal/male/${userProfile.selfProfile.animal.toLowerCase()}.png` : null;
  }

  getSeekingAnimalImage(userProfile: UserProfile | null): string | null {
    return userProfile?.seekingProfile?.animal ? `/assets/images/animal/male/${userProfile.seekingProfile.animal.toLowerCase()}.png` : null;
  }

  completeSurvey(){
    this.router.navigate(['/survey']);
  }
}