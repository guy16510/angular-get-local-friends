import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FileService } from '../../services/file.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridTile, MatGridList } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { AuthState } from '../../store/states/auth.state';
import { SetUserProfileImage } from '../../store/actions/auth.actions';

@Component({
    selector: 'app-upload-image',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.css'],
    imports: [
        CommonModule,
        MatGridTile,
        MatGridList,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule
    ]
})
export class UploadComponent {
  selectedFile?: File;
  uploadedUrls: string[] = []; // Initialize uploadedUrls as an empty array

  constructor(
    private fileService: FileService,
    private snackBar: MatSnackBar,
    private store: Store
  ) {}

  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async upload(): Promise<void> {
    if (!this.selectedFile) {
      this.snackBar.open('Please select a file to upload.', 'Close', { duration: 3000 });
      return;
    }
  
    const identityId = this.store.selectSnapshot(AuthState.identityId);
    if (!identityId) {
      this.snackBar.open('User is not authenticated.', 'Close', { duration: 3000 });
      return;
    }
  
    try {
      const webpBlob = await this.fileService.convertToWebP(this.selectedFile);
      const uploadUrl = await this.fileService.uploadFile(identityId, webpBlob);
  
      this.store.dispatch(new SetUserProfileImage(uploadUrl));
      this.snackBar.open('Profile image uploaded successfully!', 'Close', { duration: 3000 });
    } catch (error: any) {
      console.error('Upload error:', error);
      this.snackBar.open(error.message || 'An error occurred during upload.', 'Close', { duration: 5000 });
    }
  }
}