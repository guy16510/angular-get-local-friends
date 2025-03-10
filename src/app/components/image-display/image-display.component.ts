import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';

@Component({
    selector: 'app-image-display',
    imports: [CommonModule],
    templateUrl: './image-display.component.html',
    styleUrl: './image-display.component.css'
})
export class ImageDisplayComponent implements OnInit {
  @Input() identityId: string = '';
  imgSrc: string | null = null;
  defaultImg = '/assets/images/noImageUploaded.jpg';

  constructor(private fileService: FileService) {}

  async ngOnInit() {
    try {
      this.imgSrc = await this.fileService.getUserImage(this.identityId);
    } catch (error) {
      console.error('❌ Error loading user image:', error);
      this.imgSrc = this.defaultImg;
    }
  }
}