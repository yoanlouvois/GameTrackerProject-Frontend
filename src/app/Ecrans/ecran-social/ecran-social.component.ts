import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserDto } from '../../api/models/user-dto';
import { TokenDecodeService } from '../../services/token/token-decode.service';
import { FriendshipControllerService } from '../../api/services/friendship-controller.service';
import { FriendshipDto } from '../../api/models/friendship-dto';

/**
 * @component EcranSocialComponent
 * @description Gère l'affichage des amis acceptés et permet la navigation vers l'ajout d'amis et les discussions.
 */
@Component({
  selector: 'app-ecran-social',
  imports: [CommonModule],
  templateUrl: './ecran-social.component.html',
  styleUrls: ['./ecran-social.component.scss']
})
export class EcranSocialComponent {
  /** ID de l'utilisateur connecté */
  userId: number | null = null;

  /** Liste des amis de l'utilisateur */
  friends: UserDto[] = [];

  constructor(
    private router: Router,
    private tokenDecodeService: TokenDecodeService,
    private friendshipControllerService: FriendshipControllerService
  ) {}

  /**
   * @method ngOnInit
   * @description Initialise le composant en récupérant l'ID utilisateur et charge la liste des amis.
   */
  ngOnInit(): void {
    this.userId = this.tokenDecodeService.getUserId();
    if (this.userId !== null) {
      this.loadFriends();
    } else {
      console.error(" Impossible de récupérer l'ID utilisateur.");
    }
  }

  /**
   * @method loadFriends
   * @description Charge la liste des amis acceptés de l'utilisateur.
   */
  private loadFriends(): void {
    this.friendshipControllerService.getAllFriendshipsForUser({ userId: this.userId! }).subscribe({
      next: (friendships: FriendshipDto[]) => {
        // Filtrer les amitiés pour ne garder que celles qui sont ACCEPTED
        this.friends = friendships
          .filter(f => f.status === 'ACCEPTED') // Filtrer par statut "ACCEPTED"
          .map(f => f.user1?.id === this.userId ? f.user2! : f.user1!); // Récupérer l'autre utilisateur de l'amitié

        console.log(" Amis acceptés récupérés :", this.friends);
      },
      error: (err: any) => {
        console.error(" Erreur lors de la récupération des amis :", err);
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

  /**
   * @method goAjouterAmi
   * @description Redirige l'utilisateur vers la page d'ajout d'ami.
   */
  goAjouterAmi(): void {
    this.router.navigate(['/AjouterAmi']);
  }

  /**
   * @method goDiscussions
   * @description Redirige l'utilisateur vers la discussion avec un ami sélectionné.
   * @param {string | undefined} friendName - Nom de l'ami avec qui ouvrir la discussion
   */
  goDiscussions(friendName: string | undefined): void {
    if (friendName) {
      this.router.navigate(['/Discussions', friendName]);
    } else {
      console.error(" Erreur : le nom de l'ami est indéfini.");
    }
  }
}
