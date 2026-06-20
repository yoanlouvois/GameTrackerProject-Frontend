import { Component, OnInit } from '@angular/core';
import { FriendshipControllerService } from '../../api/services/friendship-controller.service';
import { Router } from '@angular/router';
import { TokenDecodeService } from '../../services/token/token-decode.service';
import { UserDto } from '../../api/models/user-dto';
import { CommonModule } from '@angular/common';
import { FriendshipDto } from '../../api/models/friendship-dto';

/**
 * @component EcranNotificationsComponent
 * @description Gère l'affichage et la gestion des demandes d'amitié et des amis de l'utilisateur connecté.
 */
@Component({
  selector: 'app-ecran-notifications',
  templateUrl: './ecran-notifications.component.html',
  styleUrls: ['./ecran-notifications.component.scss'],
  imports: [CommonModule]
})
export class EcranNotificationsComponent implements OnInit {
  /** ID de l'utilisateur connecté */
  userId: number | null = null;

  /** Liste des demandes d'amitié en attente */
  pendingRequests: UserDto[] = [];

  /** Liste des amis de l'utilisateur */
  friends: UserDto[] = [];

  constructor(
    private router: Router,
    private tokenDecodeService: TokenDecodeService,
    private friendshipControllerService: FriendshipControllerService
  ) {}

  /**
   * @method ngOnInit
   * @description Initialise le composant en récupérant l'ID utilisateur et charge les demandes d'amitié.
   */
  ngOnInit(): void {
    this.userId = this.tokenDecodeService.getUserId();
    if (this.userId !== null) {
      this.loadPendingRequests();
    } else {
      console.error(" Impossible de récupérer l'ID utilisateur.");
    }
  }

  /**
   * @method loadPendingRequests
   * @description Charge la liste des demandes d'amitié en attente.
   */
  private loadPendingRequests(): void {
    this.friendshipControllerService.getPendingRequests({ userId: this.userId! }).subscribe({
      next: (requests: UserDto[]) => {
        this.pendingRequests = requests;
        console.log(" Demandes d'amitié en attente :", this.pendingRequests);
      },
      error: (err: any) => {
        console.error(" Erreur lors de la récupération des demandes d'amitié :", err);
      }
    });
  }

  /**
   * @method getFriendshipId
   * @description Récupère l'ID d'une relation d'amitié entre l'utilisateur et un autre.
   * @param {number} user1Id - ID du premier utilisateur
   * @param {number} user2Id - ID du second utilisateur
   */
  private getFriendshipId(user1Id: number, user2Id: number): void {
    this.friendshipControllerService.getFriendshipBetweenUsers({ user1Id, user2Id }).subscribe({
      next: (friendship: FriendshipDto) => {
        if (friendship.id !== undefined) {
          this.acceptFriendRequest(friendship.id);
        } else {
          console.error("Aucune amitié trouvée entre les utilisateurs.");
        }
      },
      error: (err: unknown) => {
        console.error("Erreur lors de la récupération de l'ID de l'amitié :", err);
      }
    });
  }

  /**
   * @method acceptFriendRequestByUserIds
   * @description Accepte une demande d'amitié en recherchant d'abord l'ID de l'amitié correspondante.
   * @param {number} requesterId - ID de l'utilisateur qui a envoyé la demande
   */
  acceptFriendRequestByUserIds(requesterId: number): void {
    if (this.userId !== null) {
      this.getFriendshipId(requesterId, this.userId);
    } else {
      console.error(" Utilisateur non connecté.");
    }
  }

  /**
   * @method acceptFriendRequest
   * @description Accepte une demande d'amitié et met à jour la liste des demandes.
   * @param {number} friendshipId - ID de l'amitié à accepter
   */
  private acceptFriendRequest(friendshipId: number): void {
    this.friendshipControllerService.acceptFriendRequest({ friendshipId }).subscribe({
      next: (response: any) => {
        console.log(" Demande acceptée :", response);
        this.pendingRequests = this.pendingRequests.filter(request => request.id !== friendshipId);
        window.location.reload();
      },
      error: (err: any) => {
        console.error(" Erreur lors de l'acceptation de la demande d'amitié :", err);
      }
    });
  }

  /**
   * @method removeFriend
   * @description Supprime un ami de la liste de l'utilisateur.
   * @param {UserDto} friend - Objet représentant l'ami à supprimer
   */
  removeFriend(friend: UserDto): void {
    if (this.userId === null || friend.id === undefined) {
      console.error(" Impossible de supprimer l'ami : ID utilisateur ou ami manquant.");
      return;
    }

    // Récupérer l'ID de l'amitié pour pouvoir la supprimer
    this.friendshipControllerService.getFriendshipBetweenUsers({ user1Id: this.userId, user2Id: friend.id }).subscribe({
      next: (friendship: FriendshipDto) => {
        if (!friendship.id) {
          console.error(" Amitié introuvable pour suppression.");
          return;
        }

        // Suppression de l'amitié
        this.friendshipControllerService.deleteFriendship({ friendshipId: friendship.id }).subscribe({
          next: () => {
            console.log(` Amitié avec ${friend.username} supprimée.`);
            this.friends = this.friends.filter(f => f.id !== friend.id);
            window.location.reload();
          },
          error: (err: any) => {
            console.error(" Erreur lors de la suppression :", err);
          }
        });
      },
      error: (err: any) => {
        console.error(" Erreur lors de la récupération de l'amitié :", err);
      }
    });
  }
}
