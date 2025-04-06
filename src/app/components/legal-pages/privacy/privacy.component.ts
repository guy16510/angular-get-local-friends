import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { scrollToTop } from '../../../utils/window.utils';
import { MaterialModule } from '../../../utils/material.module';


@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css'],
  standalone: true,
  imports: [CommonModule, MaterialModule]
})
export class PrivacyComponent implements OnInit {
  ngOnInit(): void {
    scrollToTop();
  }
}
