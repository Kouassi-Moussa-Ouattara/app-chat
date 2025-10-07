import { Component, inject, OnInit } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterOutlet } from '@angular/router';
import { VideoChatService } from './service/video-chat.service';
import { AuthServiceService } from './service/auth.service';
import {MatDialog} from '@angular/material/dialog';
import { VideoChatComponent } from './video-chat/video-chat.component';

@Component({
  selector: 'app-root',
  imports: [MatSlideToggleModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'FRONTEND';

  private signalRService = inject(VideoChatService);
  private authService = inject(AuthServiceService);
  private dialog = inject(MatDialog);


   ngOnInit(): void {
    if(!this.authService.getAccessToken) return;
    this.signalRService.startConnection();
    this.startOfferReceive();
  }

  startOfferReceive(){
    this.signalRService.offerReceived.subscribe(async(data)=>{
      if(data){
        let audio = new Audio('assets/phone-ring.mp3');
        audio.play();
        this.dialog.open(VideoChatComponent,{
          width:"400px",
          height:"600px",
          disableClose:false,
        });
        this.signalRService.remoteUserId= data.senderId;
        this.signalRService.incomingCall = true;
      }
    })
  }
}
