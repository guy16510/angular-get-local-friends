import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';

@Component({
    selector: 'app-image-display',
    imports: [CommonModule],
    templateUrl: './image-display.component.html',
    styleUrl: './image-display.component.scss'
})
export class ImageDisplayComponent implements OnInit {
  @Input() identityId: string = '';
  imgSrc: string | null = null;
  defaultImg = '/assets/images/noImageUploaded.jpg';
  isLoading = true;

  constructor(private fileService: FileService) {}

  async ngOnInit() {
    try {
      this.isLoading = true;
      this.imgSrc = await this.fileService.getUserImage(this.identityId);
    } catch (error: any) {
      // Only log unexpected errors
      if (!error.message?.includes('No profile image found')) {
        console.warn('⚠️ Unexpected error loading profile image:', error.message || error);
      }
      this.imgSrc = this.defaultImg;
    } finally {
      this.isLoading = false;
    }
  }
  
  onImgError(): void {
    // Optionally, you can log this event or silently handle it
    // console.warn('Image failed to load, using default.');
    this.imgSrc = this.defaultImg;
  }
}