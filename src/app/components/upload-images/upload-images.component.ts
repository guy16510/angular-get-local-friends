// src/app/components/upload-images/upload-images.component.ts
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Import from the main package per Amplify Angular docs
// import Amplify, { Storage, API } from 'aws-amplify';
// import awsExports from '../../../aws-exports';


@Component({
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styleUrls: ['./upload-images.component.css']
})
export class UploadImagesComponent {
  selectedFiles: File[] = [];
  maxFileSize = 3 * 1024 * 1024; // 3 MB per file
  maxFiles = 5;
  uploadedKeys: string[] = [];
  uploadedUrls: string[] = [];
  
  // In a real app, get the current user's id from Auth
  currentUserId: string = 'exampleUserId';
  
  constructor(private snackBar: MatSnackBar) {
    // For production, retrieve the user ID via Auth.currentUserInfo() or similar.
  }
  
  onFileSelected(event: any): void {
    // const files: FileList = event.target.files;
    // if (files.length > this.maxFiles) {
    //   this.snackBar.open(`You can only upload up to ${this.maxFiles} images`, 'Close', { duration: 3000 });
    //   return;
    // }
    // this.selectedFiles = [];
    // for (let i = 0; i < files.length; i++) {
    //   if (files[i].size > this.maxFileSize) {
    //     this.snackBar.open(`File ${files[i].name} exceeds the size limit of 3MB`, 'Close', { duration: 3000 });
    //   } else {
    //     this.selectedFiles.push(files[i]);
    //   }
    // }
  }
  
  async uploadFiles(): Promise<void> {
    // if (this.selectedFiles.length === 0) return;
    // this.uploadedKeys = [];
    // this.uploadedUrls = [];
    
    // // Upload each file to S3 at level 'protected'
    // for (const file of this.selectedFiles) {
    //   try {
    //     const fileName = `${Date.now()}-${file.name}`;
    //     const result = await Storage.put(fileName, file, {
    //       level: 'protected',
    //       contentType: file.type
    //     });
    //     this.uploadedKeys.push(result.key);
    //   } catch (error) {
    //     console.error('Error uploading file:', error);
    //     this.snackBar.open(`Error uploading ${file.name}`, 'Close', { duration: 3000 });
    //   }
    // }
    
    // // Retrieve URLs for each uploaded file
    // for (const key of this.uploadedKeys) {
    //   try {
    //     const url = await Storage.get(key, { level: 'protected' });
    //     this.uploadedUrls.push(url as string);
    //   } catch (error) {
    //     console.error('Error getting file URL:', error);
    //   }
    // }
    
    // this.snackBar.open('Files uploaded successfully!', 'Close', { duration: 3000 });
    
    // // Update the user's profile with the uploaded image keys via GraphQL mutation.
    // try {
    //   const mutation = `
    //     mutation UpdateUserImages($userId: String!, $images: [String]) {
    //       updateUserImages(userId: $userId, images: $images)
    //     }
    //   `;
    //   const variables = {
    //     userId: this.currentUserId,
    //     images: this.uploadedKeys
    //   };
    //   const result: any = await API.graphql({ query: mutation, variables });
    //   console.log('UserProfile updated with images:', result);
    // } catch (err) {
    //   console.error('Error updating UserProfile with images:', err);
    // }
  }
}