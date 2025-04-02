import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FileService } from '../../services/file.service';
import { Store } from '@ngxs/store';
import { AuthState } from '../../store/states/auth.state';
import { SetUserProfileImage } from '../../store/actions/auth.actions';
import { ToastMessageService } from '../../services/toast-message.service';

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
    private toastService: ToastMessageService,
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
      this.toastService.info('Please select a file to upload.', 'Close');
      return;
    }
  
    const identityId = this.store.selectSnapshot(AuthState.identityId);
    if (!identityId) {
      this.toastService.info('User is not authenticated.', 'Close');
      return;
    }
  
    try {
      const webpBlob = await this.fileService.convertToWebP(this.selectedFile);
      const uploadResult = await this.fileService.uploadFile(identityId, webpBlob);
      debugger;
      this.store.dispatch(new SetUserProfileImage(uploadResult));
      this.toastService.success('Profile image uploaded successfully!', 'Close');
      this.imageUpdated.emit(uploadResult);
    } catch (error: any) {
      console.error('Upload error:', error);
      this.toastService.error(error.message || 'An error occurred during upload.', 'Close');
    }
  }
}