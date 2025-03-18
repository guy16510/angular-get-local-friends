import { Component, OnInit, inject } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserProfile } from '../../models/user-profile.model';
import { UserProfileState } from '../../store/states/user-profile.state';
import { LoadUserProfile, SubmitUserProfile } from '../../store/actions/user-profile.actions';
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

  profileImage: string = '/assets/images/noImageUploaded.jpg';
  private store = inject(Store);

  constructor(private fileService: FileService) {}
  
  async ngOnInit(): Promise<void> {
    this.store.dispatch(new LoadUserProfile());
    await this.loadUserProfile();
  }

  onSubmit(updatedProfile: UserProfile): void {
    this.store.dispatch(new SubmitUserProfile(updatedProfile));
  }

  
  //TODO
// add ability to update the user images.
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
}