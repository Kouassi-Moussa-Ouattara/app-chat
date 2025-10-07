import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/User';
import { AuthServiceService } from './auth.service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Message } from '../models/message';


@Injectable({
  providedIn: 'root'
})
export class ChatService {


  private authService = inject(AuthServiceService);
  private hubUrl = "http://localhost:5000/hubs/chat";
  onlineUsers = signal<User[]>([]);
  currentOpenedChat = signal<User | null>(null);
  chatMessages = signal<Message[]>([]);
  isLoading = signal<boolean>(true);
  autoScrollEnabled = signal<boolean>(true);

  private hubConnection?: HubConnection;

  startConnection(token: string, senderId?: string) {
    if(this.hubConnection?.state === HubConnectionState.Connected) return;

    if(this.hubConnection){
      this.hubConnection.off('ReceiveNewMessage');
      this.hubConnection.off('ReceiveMessageList');
      this.hubConnection.off('OnlineUsers');
      this.hubConnection.off('NotifyTypingToUser');
      this.hubConnection.off('Notify');
    }
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?senderId=${senderId || ''}`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => {
        console.log('Connection commencée !');
      })
      .catch((error) => {
        console.log('Erreur de connexion', error);
      });

      this.hubConnection!.on('Notify', (user:User)=>{
        Notification.requestPermission().then((result)=>{
          if(result == "granted"){
          new Notification('Actif 🔵', {
            body:user.fullName + ' est en ligne.',
            icon:user.profileImage,
          });
          }
        });
      });

    this.hubConnection!.on('onlineUsers', (user: User[]) => {
      console.log(user);
      this.onlineUsers.update(() =>
        user.filter(user => user.userName !== this.authService.currentLoggedUser!.userName
        )
      );
    });

    this.hubConnection!.on("ReceiveMessageList", (message) => {
      this.isLoading.update(()=>true);
      this.chatMessages.update(messages => [...message, ...messages]);
      this.isLoading.update(() => false);
    });

    this.hubConnection!.on("NotifytypingToUser",(senderUserName)=>{
      this.onlineUsers.update(users=>
        users.map((user)=>{
          if(user.userName === senderUserName)
            {
              user.istyping = true;
            }
            return user;
        })
      );
          setTimeout(()=>{
      this.onlineUsers.update((users)=>
      users.map((user)=>{
        if(user.userName === senderUserName)
        {
          user.istyping = false;
        }
        return user;
      })
      );
    },2000);
    });

    this.hubConnection!.on('ReceiveNewMessage',(message:Message)=>{

      let audio = new Audio('assets/notification.mp3');
      audio.play();
      document.title='(1) Nouveau message';
      this.chatMessages.update((messages)=>[...messages,message]);
    })
  }

  disConnectConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch((error) => console.log(error));
    }
  }

  sendMessage(message:string){
    this.chatMessages.update((messages)=>[
      ...messages,
      {
        content:message,
        senderId:this.authService.currentLoggedUser!.id,
        receiverId:this.currentOpenedChat()?.id!,
        createDate:new Date().toString(),
        isRead:false,
        id:0
      }
    ])
    this.hubConnection?.invoke('sendMessage',{
      receiverId:this.currentOpenedChat()?.id,
      content:message
    }).then((id)=>{
      console.log("Message envoyer",id);
    }).catch((error)=>{
      console.log(error);
    });
  }

  statut(userName: string): string {
    const currentChatUser = this.currentOpenedChat();
    if (!currentChatUser) {
      return 'offline';
    }
    const onlineUser = this.onlineUsers().find(
      (user) => user.userName === userName
    )

    return onlineUser?.istyping ? 'Typing...' : this.isUserOnline();
  }

  isUserOnline(): string {
    let onlineUser = this.onlineUsers().find(user => user.userName === this.currentOpenedChat()?.userName);

    return onlineUser?.isOnline ? 'En ligne' : this.currentOpenedChat()!.userName;
  }

  loadMessages(pageNumber: number) {
    this.isLoading.update(()=>true);
    this.hubConnection?.invoke("LoadMessages", this.currentOpenedChat()?.id, pageNumber)
      .then()
      .catch()
      .finally(() => {
        this.isLoading.update(() => false);
      });
  }

  notifyTyping(){
    this.hubConnection!.invoke('NotifyTyping',
      this.currentOpenedChat()?.userName
    ).then((x)=>{
      console.log('Notification pour', x);
    }).catch((error)=>{
      console.log(error);
    });
  }
}
