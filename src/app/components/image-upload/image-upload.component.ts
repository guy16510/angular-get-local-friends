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
      this.snackBar.open('No file selected!', 'Close', { duration: 3000 });
      return;
    }
  
    try {
      console.log("Uploading file...", this.selectedFile);
      const uploadedImageUrl = await this.fileService.uploadFile(this.selectedFile);
      
      console.log("✅ Upload completed successfully. File URL:", uploadedImageUrl);
  
      this.uploadedUrls.push(uploadedImageUrl); // ✅ Store uploaded file URL
  
      this.snackBar.open('File uploaded successfully!', 'Close', { duration: 3000 });
    } catch (error: any) {
      console.error('❌ Error uploading file:', error);
  
      if (error.message.includes("You do not have permission to upload files")) {
        this.snackBar.open("You don't have permission to upload files. Contact support.", 'Close', { duration: 5000 });
      } else if (error.message.includes("Network issue or invalid credentials")) {
        this.snackBar.open('Network issue detected. Please check your connection.', 'Close', { duration: 5000 });
      } else {
        this.snackBar.open('Error uploading file. Please try again.', 'Close', { duration: 3000 });
      }
    }
  }
}