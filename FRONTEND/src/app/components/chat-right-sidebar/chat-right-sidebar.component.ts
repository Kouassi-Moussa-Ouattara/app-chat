import { Component, inject } from '@angular/core';
import { ChatService } from '../../service/chat.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-chat-right-sidebar',
  imports: [TitleCasePipe],
  templateUrl: './chat-right-sidebar.component.html',
  styles: ``
})
export class ChatRightSidebarComponent {
chatService = inject(ChatService);
}
