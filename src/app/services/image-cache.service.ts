import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageCacheService {
  private TTL = 86400000; // 24 hours TTL

  get(identityId: string): string | null {
    const cached = localStorage.getItem(`user-image-${identityId}`);
    if (cached) {
      const { url, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < this.TTL) return url;
      localStorage.removeItem(`user-image-${identityId}`);
    }
    return null;
  }

  set(identityId: string, url: string): void {
    localStorage.setItem(`user-image-${identityId}`, JSON.stringify({
      url,
      timestamp: Date.now()
    }));
  }
}