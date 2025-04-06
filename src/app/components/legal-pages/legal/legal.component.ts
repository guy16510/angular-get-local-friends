import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../utils/material.module';
import { scrollToTop } from '../../../utils/window.utils';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.css'],
  standalone: true,
  imports: [CommonModule, MaterialModule]
})
export class LegalComponent implements OnInit {
  ngOnInit(): void {
    scrollToTop();
  }
}
