import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserDto } from '../../api/models/user-dto';
import { TokenDecodeService } from '../../services/token/token-decode.service';
import { MessageControllerService } from '../../api/services/message-controller.service';
import { MessageDto } from '../../api/models/message-dto';
import { PageMessageDto } from '../../api/models/page-message-dto';
import { FriendshipControllerService } from '../../api/services/friendship-controller.service';
import { SendMessage$Params } from '../../api/fn/message-controller/send-message';
import { CommonModule } from '@angular/common';

/**
 * @component EcranDiscussionsComponent
 * @description Gère l'affichage et l'envoi de messages entre utilisateurs dans une discussion privée.
 */
@Component({
  selector: 'app-ecran-discussions',
  imports: [
    CommonModule,  // Nécessaire pour les directives Angular courantes
  ],
  templateUrl: './ecran-discussions.component.html',
  styleUrls: ['./ecran-discussions.component.scss']
})
export class EcranDiscussionsComponent implements OnInit {
  /** ID de l'utilisateur connecté */
  userId: number | null = null;

  /** Référence vers le conteneur des messages pour permettre le défilement automatique */
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  /** Liste des messages de la conversation */
  messages: MessageDto[] = [];

  /** Informations de l'ami avec qui l'utilisateur discute */
  friend: UserDto | null | undefined = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tokenDecodeService: TokenDecodeService,
    private messageControllerService: MessageControllerService,
    private friendshipControllerService: FriendshipControllerService,
    private cdr: ChangeDetectorRef // Permet d'actualiser la vue après envoi de message
  ) {}

  /**
   * @method ngOnInit
   * @description Initialise le composant en récupérant l'ID utilisateur et les informations de l'ami
   */
  ngOnInit() {
    // Récupérer l'ID utilisateur à partir du token JWT
    this.userId = this.tokenDecodeService.getUserId();
    if (this.userId === null) {
      console.error("Impossible de récupérer l'ID utilisateur.");
      return;
    }

    // Récupérer le pseudo de l'ami depuis l'URL et charger ses informations
    this.route.paramMap.subscribe(params => {
      const friendName = params.get('friendName');
      if (friendName) {
        this.loadFriendData(friendName);
      }
    });
  }

  /**
   * @method loadFriendData
   * @description Récupère les informations de l'ami en fonction de son pseudo et charge les messages
   * @param {string} friendName - Pseudo de l'ami
   */
  private loadFriendData(friendName: string) {
    this.friendshipControllerService.getAllFriendshipsForUser({ userId: this.userId! }).subscribe({
      next: (friendships: any[]) => {
        const friendship = friendships.find(f =>
          (f.user1?.username === friendName || f.user2?.username === friendName)
        );

        if (friendship) {
          this.friend = friendship.user1?.username === friendName ? friendship.user1 : friendship.user2;
          if (this.friend) {
            this.loadMessages();
          } else {
            console.error("L'ami n'a pas été trouvé.");
          }
        } else {
          console.error("Amitié introuvable avec", friendName);
        }
      },
      error: (err: any) => console.error("Erreur lors de la récupération des amis", err)
    });
  }

  /**
   * @method loadMessages
   * @description Charge les messages de la conversation entre l'utilisateur connecté et son ami
   */
  private loadMessages() {
    if (!this.friend) return;

    this.messageControllerService.getConversation({
      user1Id: this.userId!,
      user2Id: this.friend.id!,
      pageable: { page: 0, size: 50, sort: ['creationDate,desc'] }
    }).subscribe({
      next: (conversation: PageMessageDto) => {
        this.messages = conversation.content || [];
        this.scrollToBottom(); // Faire défiler vers le dernier message
      },
      error: (err: any) => console.error("Erreur lors de la récupération des messages", err)
    });
  }

  /**
   * @method sendMessage
   * @description Envoie un message à l'ami et met à jour la liste des messages affichés
   * @param {HTMLInputElement} input - Champ de saisie contenant le message
   */
  sendMessage(input: HTMLInputElement) {
    if (!this.friend) return;

    const messageText = input.value.trim();
    if (messageText === '') return;

    // Création de l'objet MessageDto pour l'envoi
    const messageDto: MessageDto = {
      content: messageText,
      creationDate: new Date().toISOString(),
      sender: {
        id: this.userId!,
        username: 'Nom d’utilisateur', // À remplacer par les données réelles
      },
      receiver: {
        id: this.friend.id!,
        username: this.friend.username!,
      },
    };

    const params: SendMessage$Params = {
      body: messageDto
    };

    // Envoi du message via le service
    this.messageControllerService.sendMessage(params).subscribe({
      next: (sentMessage: any) => {
        this.messages.push(sentMessage);
        this.cdr.detectChanges(); // Forcer l'affichage du nouveau message
        this.scrollToBottom(); // Faire défiler vers le bas
      },
      error: (err: any) => console.error("Erreur lors de l'envoi du message", err)
    });

    input.value = ""; // Réinitialiser le champ de saisie
  }

  /**
   * @method scrollToBottom
   * @description Fait défiler l'écran vers le bas pour afficher le dernier message envoyé
   */
  private scrollToBottom() {
    setTimeout(() => {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }, 100);
  }

  /**
   * @method goToSocial
   * @description Redirige l'utilisateur vers la page Social
   */
  goToSocial() {
    this.router.navigate(['/Social']);
  }
}
