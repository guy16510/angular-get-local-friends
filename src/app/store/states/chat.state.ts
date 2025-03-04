import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ReceiveMessage } from '../actions/chat.actions';
import { ChatMessage } from '../../models/chat';

export interface ChatStateModel {
  messages: ChatMessage[];
}

@State<ChatStateModel>({
  name: 'chat',
  defaults: {
    messages: []
  }
})
export class ChatState {
  @Selector()
  static messages(state: ChatStateModel) {
    return state.messages;
  }

  @Action(ReceiveMessage)
  receiveMessage(ctx: StateContext<ChatStateModel>, action: ReceiveMessage) {
    const state = ctx.getState();
    ctx.setState({
      messages: [...state.messages, action.payload.message]
    });
  }
}