import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../utils/material.module';
import { scrollToTop } from '../../../utils/window.utils';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css'],
  standalone: true,
  imports: [CommonModule, MaterialModule]
})
export class TermsComponent implements OnInit {
  ngOnInit(): void {
    scrollToTop();
  }
}
