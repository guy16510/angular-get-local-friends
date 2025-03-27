import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-chat-reaction',
  templateUrl: './chat-reaction.component.html',
  styleUrls: ['./chat-reaction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatReactionComponent {
  @Input() messageId!: string;
  @Input() reactions: any = [];
  @Output() addReaction = new EventEmitter<string>();

  onEmojiClick(emoji: string) {
    this.addReaction.emit(emoji);
  }
}
