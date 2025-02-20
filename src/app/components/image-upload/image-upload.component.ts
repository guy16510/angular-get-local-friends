import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FileService } from '../../services/file.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridTile, MatGridList } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-upload-image',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css'],
  imports: [CommonModule, MatGridTile, MatGridList, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule]
})
export class UploadComponent {
  selectedFile?: File;
  uploadedUrls: string[] = []; // ✅ Initialize uploadedUrls as an empty array

  constructor(private fileService: FileService, private snackBar: MatSnackBar, private authSerivce: AuthService) {}

  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async upload(): Promise<void> {
    if (!this.selectedFile) {
      this.snackBar.open('No file selected!', 'Close', { duration: 3000 });
      return;
    }
    try {
      await this.fileService.uploadFile(this.selectedFile);

      // ✅ Fetch the newly uploaded file URL
      const identityId = await this.authSerivce.getIdentityId() || null;
      const uploadedImageUrl = await this.fileService.getUserImage(identityId);
      
      if (uploadedImageUrl) {
        this.uploadedUrls.push(uploadedImageUrl); // ✅ Add URL to the array
      }

      this.snackBar.open('File uploaded successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error uploading file:', error);
      this.snackBar.open('Error uploading file!', 'Close', { duration: 3000 });
    }
  }
}