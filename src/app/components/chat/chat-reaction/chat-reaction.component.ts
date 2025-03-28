import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-chat-reaction',
  templateUrl: './chat-reaction.component.html',
  styleUrls: ['./chat-reaction.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:[CommonModule]
})
export class ChatReactionComponent {
  @Input() messageId!: string;
  @Input() reactions: any = [];
  @Output() addReaction = new EventEmitter<string>();

  expanded = false;
  // Define the set of emoji tapbacks
  emojiList: string[] = ['❤️', '😂', '😮', '😢', '👏'];

  constructor(private _elementRef: ElementRef) {}

  // Toggle the emoji popup; stop propagation so the document click handler won’t immediately close it.
  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.expanded = !this.expanded;
  }

  // Handle emoji selection
  onEmojiClick(emoji: string, event: Event): void {
    event.stopPropagation();
    this.addReaction.emit(emoji);
    this.expanded = false;
  }

  // Optionally, you can add long press detection for mobile here
  onTouchStart(event: TouchEvent): void {
    // For a full implementation, add long press logic if desired.
  }

  onTouchEnd(event: TouchEvent): void {
    // For a full implementation, add long press logic if desired.
  }

  // Listen for clicks anywhere in the document. If the click happens outside the reaction component, collapse it.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.expanded = false;
    }
  }
}