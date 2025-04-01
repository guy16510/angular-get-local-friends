import { Injectable } from '@angular/core';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { IndexedDBService } from './indexeddb.service';

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly CACHE_TTL = 3600000; // 1 hour TTL

  constructor(private indexedDB: IndexedDBService) {}

  async convertToWebP(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            blob => (blob ? resolve(blob) : reject(new Error('Canvas to blob conversion failed'))),
            'image/webp',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsDataURL(file);
    });
  }

  async uploadFile(identityId: string, fileBlob: Blob): Promise<string> {
    const uploadPath = `protected/${identityId}/profile.webp`;
    try {
      // Upload the file
      await uploadData({
        path: uploadPath,
        data: fileBlob,
        options: { contentType: 'image/webp' },
      });

      // Clear the cache to ensure we get the fresh image
      await this.indexedDB.delete(`user-image-${identityId}`);

      // Add a small delay to ensure the upload is processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the URL and fetch the image
      const urlResult = await getUrl({ path: uploadPath });
      const blob = await this.fetchAndCache(urlResult.url.toString(), identityId);
      
      if (!blob) {
        // If we can't fetch the image immediately, return a URL to the uploaded file
        return urlResult.url.toString();
      }

      return URL.createObjectURL(blob);
    } catch (error: any) {
      console.error('❌ Failed to upload profile image:', error.message || error);
      throw new Error(`Failed to upload profile image: ${error.message || error}`);
    }
  }

  async getUserImage(identityId: string): Promise<string | null> {
    const cached = await this.indexedDB.get(`user-image-${identityId}`);
    if (cached) return URL.createObjectURL(cached);

    try {
      const result = await getUrl({ path: `protected/${identityId}/profile.webp` });
      const blob = await this.fetchAndCache(result.url.toString(), identityId);
      return blob ? URL.createObjectURL(blob) : null;
    } catch (err: any) {
      // Don't log 403 errors as they're expected when no image exists
      if (err.message?.includes('403') || err.status === 403) {
        return null;
      }
      console.error('❌ Error fetching profile image:', err.message || err);
      return null;
    }
  }

  private async fetchAndCache(url: string, identityId: string): Promise<Blob | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        // Don't throw for 403 as it's an expected case
        if (response.status === 403) {
          return null;
        }
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      await this.indexedDB.set(`user-image-${identityId}`, blob);
      return blob;
    } catch (error: any) {
      // If it's a 403, return null instead of throwing
      if (error.message?.includes('403') || error.status === 403) {
        return null;
      }
      throw new Error(`Failed to fetch image: ${error.message || error}`);
    }
  }
}