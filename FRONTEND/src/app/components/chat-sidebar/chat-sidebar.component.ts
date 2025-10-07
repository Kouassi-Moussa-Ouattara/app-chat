import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthServiceService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TitleCasePipe } from '@angular/common';
import { ChatService } from '../../service/chat.service';
import { User } from '../../models/User';
import { TypingIndicatorComponent } from '../typing-indicator/typing-indicator.component';


@Component({
  selector: 'app-chat-sidebar',
  imports: [MatButtonModule, MatIconModule, TitleCasePipe, MatMenuModule,TypingIndicatorComponent],
  templateUrl: './chat-sidebar.component.html',
  styles: ``
})
export class ChatSidebarComponent implements OnInit {
  authService = inject(AuthServiceService);
  chatService = inject(ChatService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);


  logout() {
    this.authService.logout();
    this.snackBar.open('Vous vous êtes déconnectés(es) avec succès !', 'Close')
    this.router.navigate(['/login']);
    this.chatService.disConnectConnection();
  }

  ngOnInit(): void {
    this.chatService.startConnection(this.authService.getAccessToken!);
  }

  openChatWindow(user: User) {
    this.chatService.currentOpenedChat.set(user);
    this.chatService.loadMessages(1);
  }
}
