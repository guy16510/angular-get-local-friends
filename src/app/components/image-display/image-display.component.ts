import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatGridTile, MatGridList } from '@angular/material/grid-list';
import { MatCardModule, MatCardContent } from '@angular/material/card';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-image-display',
  standalone: true,
  imports: [MatGridTile, MatGridList, MatCardModule, MatCardContent, CommonModule],
  templateUrl: './image-display.component.html',
  styleUrl: './image-display.component.css'
})
export class ImageDisplayComponent implements OnInit {
  @Input() identityId: string = '';
  imgSrc: string = ''; // Start as empty
  defaultImg = '/assets/images/noImageUploaded.jpg'; // Fallback image

  constructor(private fileService: FileService) {}

  async ngOnInit() {
    if (!this.identityId) {
      console.warn('Identity ID is missing.');
      this.imgSrc = this.defaultImg;
      return;
    }

    try {
      const imgSource = await this.fileService.getUserImage(this.identityId);
      if (imgSource) {
        this.imgSrc = imgSource; // ✅ Assign directly, no cache logic
      } else {
        this.imgSrc = this.defaultImg; // ✅ Fallback if image not found
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      this.imgSrc = this.defaultImg; // ✅ Fallback on error
    }
  }
}