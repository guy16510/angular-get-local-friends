import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileService } from '../../services/file.service';
import { Store } from '@ngxs/store';
import { AuthState } from '../../store/states/auth.state';
import { SetUserProfileImage } from '../../store/actions/auth.actions';

@Component({
  selector: 'app-upload-image',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class UploadComponent {
  @Output() imageUpdated = new EventEmitter<string>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFile?: File;

  constructor(
    private fileService: FileService,
    private snackBar: MatSnackBar,
    private store: Store
  ) {}

  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.upload(); // Auto-trigger upload on file selection
    }
  }

  // This method lets the parent trigger the file input programmatically.
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
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
      const uploadResult = await this.fileService.uploadFile(identityId, webpBlob);
      debugger;
      this.store.dispatch(new SetUserProfileImage(uploadResult));
      this.snackBar.open('Profile image uploaded successfully!', 'Close', { duration: 3000 });
      this.imageUpdated.emit(uploadResult);
    } catch (error: any) {
      console.error('Upload error:', error);
      this.snackBar.open(error.message || 'An error occurred during upload.', 'Close', { duration: 5000 });
    }
  }
}