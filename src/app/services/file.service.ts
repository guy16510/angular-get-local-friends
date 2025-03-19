import { Injectable } from '@angular/core';
import { uploadData, getUrl } from 'aws-amplify/storage';

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly CACHE_TTL = 3600000; // ✅ 1 hour TTL (in milliseconds)

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

      const urlResult = await getUrl({ path: uploadPath });
      const base64 = await this.fetchAndCache(urlResult.url.toString(), identityId);

      console.log('✅ Uploaded and cached successfully:', uploadPath);

      return base64;
    } catch (error: any) {
      throw new Error(`Failed to upload image: ${error.message || error}`);
    }
  }

  async getUserImage(identityId: string): Promise<string | null> {
    const cachedImage = this.getCachedImage(identityId);
    if (cachedImage) {
      console.log('✅ Using cached image for:', identityId);
      return cachedImage;
    }

    console.log('📌 No cached image or cache expired. Fetching from S3.');

    try {
      const result = await getUrl({ path: `protected/${identityId}/profile.webp` });
      return await this.fetchAndCache(result.url.toString(), identityId);
    } catch (error: any) {
      console.error('❌ Error fetching user image:', error);
      return null;
    }
  }

  private async fetchAndCache(url: string, identityId: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok.');

    const blob = await response.blob();
    const base64 = await this.blobToBase64(blob);
    this.cacheImage(identityId, base64);

    return base64;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private getCachedImage(identityId: string): string | null {
    const cached = localStorage.getItem(`user-image-${identityId}`);
    if (cached) {
      const { base64, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < this.cacheTTL) return base64;
      localStorage.removeItem(`user-image-${identityId}`);
    }
    return null;
  }

  private cacheImage(identityId: string, base64: string): void {
    localStorage.setItem(
      `user-image-${identityId}`,
      JSON.stringify({ base64, timestamp: Date.now() })
    );
  }

  private cacheTTL = 3600000; // 1-hour TTL clearly set here
}