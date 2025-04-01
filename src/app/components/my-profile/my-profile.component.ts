import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { map, Observable } from 'rxjs';
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
  @Select(UserProfileState.loading) loading$!: Observable<boolean>;
  @Select(UserProfileState.error) error$!: Observable<string | null>;
  userProfile$!: Observable<UserProfile | null>;

  @ViewChild('uploadComponent') uploadComponent!: UploadComponent;

  readonly fallbackImage = '/assets/images/noImageUploaded.jpg';
  profileImage: string = this.fallbackImage;

  private store = inject(Store);

  constructor(
    private fileService: FileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.store.dispatch(new CheckAuth()).subscribe(() => {
      const identityId = this.store.selectSnapshot(AuthState.identityId);
      if (!identityId) return;
  
      // Set up the selector first
      this.userProfile$ = this.store.select(UserProfileState.getProfileById).pipe(
        map(getById => getById(identityId))
      );
  
      // Check if profile exists in state before dispatching
      const existingProfile = this.store.selectSnapshot(UserProfileState.getProfileById)(identityId);
      if (!existingProfile) {
        this.store.dispatch(new LoadUserProfile(identityId));
      }
      
      // Subscribe to userProfile$ to load image only when profile exists
      this.userProfile$.subscribe(profile => {
        if (profile) {
          this.loadProfileImage();
        }
      });
    });
  }
  

  async loadProfileImage(): Promise<void> {
    try {
      const identityId = this.store.selectSnapshot(AuthState.identityId);
      if (!identityId) throw new Error('Missing identityId');

      const imgSrc = await this.fileService.getUserImage(identityId);
      this.profileImage = imgSrc || this.fallbackImage;
    } catch (err) {
      console.error('Image load failed:', err);
      this.profileImage = this.fallbackImage;
    }
  }

  onSubmit(updatedProfile: UserProfile): void {
    this.store.dispatch(new SubmitUserProfile(updatedProfile));
  }

  triggerEdit(): void {
    this.uploadComponent?.triggerFileInput();
  }

  onImageUpdated(newImage: string): void {
    this.profileImage = newImage;
  }

  viewAnimalProfile(): void {
    this.store.dispatch(new LoadAnimalProfile());
  }

  getDeepInsights(profile: UserProfile | null) {
    return profile?.deepInsights ?? null;
  }

  getSelfAnimalImage(profile: UserProfile | null): string | null {
    const animal = profile?.selfProfile?.animal;
    return animal ? `/assets/images/animal/male/${animal.toLowerCase()}.png` : null;
  }

  getSeekingAnimalImage(profile: UserProfile | null): string | null {
    const animal = profile?.seekingProfile?.animal;
    return animal ? `/assets/images/animal/male/${animal.toLowerCase()}.png` : null;
  }

  completeSurvey(): void {
    this.router.navigate(['/survey']);
  }
}
