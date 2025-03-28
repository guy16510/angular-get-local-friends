import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-chat-reaction',
  templateUrl: './chat-reaction.component.html',
  styleUrls: ['./chat-reaction.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ChatReactionComponent {
  @Input() messageId!: string;
  @Input() reactions: any = [];
  @Output() addReaction = new EventEmitter<string>();

  onEmojiClick(emoji: string) {
    this.addReaction.emit(emoji);
  }
}
