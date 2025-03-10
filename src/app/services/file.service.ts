import { Injectable } from '@angular/core';
import { uploadData, getUrl } from 'aws-amplify/storage';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private cacheTTL = 86400000; // 1 day (milliseconds)

  /**
   * Converts a given file to WebP format.
   */
  async convertToWebP(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Canvas context error');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('Conversion to WebP failed.'));
          }, 'image/webp', 0.8);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async uploadFile(identityId: string, fileBlob: Blob): Promise<string> {
    const uploadPath = `protected/${identityId}/profile.webp`;
    try {
      await uploadData({
        path: uploadPath,
        data: fileBlob,
        options: { contentType: 'image/webp' }
      });

      const { url } = await getUrl({ path: uploadPath });
      localStorage.setItem(`user-image-${identityId}`, JSON.stringify({
        url: url.toString(),
        timestamp: Date.now()
      }));

      return url.toString();
    } catch (error: any) {
      throw new Error(`Failed to upload image: ${error.message || error}`);
    }
  }

  async getUserImage(identityId: string): Promise<string | null> {
    const cacheKey = `user-image-${identityId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { url, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 86400000) return url;
    }

    try {
      const result = await getUrl({ path: `protected/${identityId}/profile.webp` });
      const url = result.url.toString();
      localStorage.setItem(`user-image-${identityId}`, JSON.stringify({ url, timestamp: Date.now() }));
      return url;
    } catch (error: any) {
      console.warn('Image not found, returning null:', error);
      return null;
    }
  }
}