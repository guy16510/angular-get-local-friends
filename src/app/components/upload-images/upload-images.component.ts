import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FileService } from '../../services/file.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridTile, MatGridList } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styleUrls: ['./upload-images.component.css'],
  imports: [MatGridTile, MatGridList, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule]
})
export class UploadComponent {
  selectedFile?: File;
  uploadedKey: string = '';
  uploadedUrl: string = '';

  constructor(private fileService: FileService, private snackBar: MatSnackBar) {}

  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Optionally, add file validations (e.g. file size, type, etc.)
      this.selectedFile = file;
    }
  }

  async upload(): Promise<void> {
    if (!this.selectedFile) {
      this.snackBar.open('No file selected!', 'Close', { duration: 3000 });
      return;
    }
    try {
      const result = await this.fileService.uploadFile(this.selectedFile);
      this.uploadedKey = result.key;
      this.snackBar.open('File uploaded successfully!', 'Close', { duration: 3000 });
      // Optionally, you can call Storage.get() here to retrieve a URL if needed.
    } catch (error) {
      console.error('Error uploading file:', error);
      this.snackBar.open('Error uploading file!', 'Close', { duration: 3000 });
    }
  }
}