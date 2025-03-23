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
      await uploadData({
        path: uploadPath,
        data: fileBlob,
        options: { contentType: 'image/webp' },
      });
      await this.indexedDB.delete(`user-image-${identityId}`);
      const urlResult = await getUrl({ path: uploadPath });
      const blob = await this.fetchAndCache(urlResult.url.toString(), identityId);
      return URL.createObjectURL(blob);
    } catch (error: any) {
      throw new Error(`Failed to upload image: ${error.message || error}`);
    }
  }

  async getUserImage(identityId: string): Promise<string | null> {
    const cached = await this.indexedDB.get(`user-image-${identityId}`);
    if (cached) return URL.createObjectURL(cached);

    try {
      const result = await getUrl({ path: `protected/${identityId}/profile.webp` });
      const blob = await this.fetchAndCache(result.url.toString(), identityId);
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('❌ Failed to fetch user image:', err);
      return null;
    }
  }

  private async fetchAndCache(url: string, identityId: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');
    const blob = await response.blob();
    await this.indexedDB.set(`user-image-${identityId}`, blob);
    return blob;
  }
}