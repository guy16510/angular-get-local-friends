import { Injectable } from '@angular/core';
import { uploadData, getUrl, UploadDataWithPathOutput } from 'aws-amplify/storage';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() {}

  /**
   * Converts an image file to WebP format before uploading.
   * @param file The file to convert.
   * @returns A Promise resolving to a Blob containing the WebP image.
   */
  private async convertToWebP(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas context is not available.'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image to WebP.'));
            }
          }, 'image/webp', 0.8); // Adjust quality if needed
        };

        img.onerror = (error) => reject(error);
      };

      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Uploads a file as a WebP image named `profile.webp` to the user's protected storage.
   * @param file The original file to upload.
   * @returns A Promise that resolves with the upload result.
   */
  async uploadFile(file: File): Promise<string> {
    try {
      const webpBlob = await this.convertToWebP(file);
      
      const identityId = (await import('aws-amplify/auth')).getCurrentUser().then(user => user.userId);
  
      // ✅ Upload File
      const result: UploadDataWithPathOutput = await uploadData({
        data: webpBlob,
        path: () => `protected/${identityId}/profile.webp`,
        options: { contentType: 'image/webp' }
      });
  
      console.log("Upload successful:", result);
  
      // ✅ Fetch URL using getUrl()
      const fileUrl = await getUrl({ path: `protected/${identityId}/profile.webp` });
      return fileUrl.url.toString(); // ✅ Return the file URL
    } catch (error: any) {
      console.error("❌ Error uploading WebP file:", error);
  
      if (error.name === "AccessDenied" || error.message.includes("not authorized to perform: s3:PutObject")) {
        throw new Error("You do not have permission to upload files. Please contact support.");
      }
  
      if (error.message.includes("NetworkError") || error.message.includes("403")) {
        throw new Error("Network issue or invalid credentials. Please try again.");
      }
  
      throw error;
    }
  }



  /**
   * Fetch the signed URL for the user's profile image.
   * @param identityId - The Cognito Identity ID of the user.
   * @returns A Promise resolving to the signed image URL.
   */
  async getUserImage(identityId: string | null): Promise<string | null> {
    if (!identityId) {
      console.warn('Identity ID is not available.');
      return null;
    }
  
    const filePath = `protected/${identityId}/profile.webp`;
  
    try {
      // ✅ Try to get the signed URL directly
      const result = await getUrl({ path: filePath });
      return result.url.toString() || null;
    } catch (error: any) {
      // ✅ If the file doesn't exist, return null (avoids unnecessary LIST request)
      if (error.name === 'NoSuchKey' || error.message.includes('does not exist')) {
        console.warn(`File not found: ${filePath}`);
        return null;
      }
  
      console.error('Error fetching image URL:', error);
      return null;
    }
  }
}