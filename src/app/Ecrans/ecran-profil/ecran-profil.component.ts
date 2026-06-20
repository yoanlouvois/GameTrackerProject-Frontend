import { Component, OnInit } from '@angular/core';
import {MatButton} from '@angular/material/button';
import {Router} from '@angular/router';
import {TokenService} from '../../services/token/token.service';
import { TokenDecodeService } from '../../services/token/token-decode.service';
import { UserControllerService } from '../../api/services/user-controller.service'; // Import du service généré
import { UserDto } from '../../api/models/user-dto'; // Import du modèle utilisateur
import { FriendshipControllerService } from '../../api/services/friendship-controller.service';
import { UserAchievementControllerService } from '../../api/services/user-achievement-controller.service';
import { GameProgressControllerService } from '../../api/services/game-progress-controller.service';

@Component({
  selector: 'app-ecran-profil',
  imports: [

  ],
  templateUrl: './ecran-profil.component.html',
  styleUrl: './ecran-profil.component.scss'
})
export class EcranProfilComponent implements OnInit{

  friendsCount: number = 0;
  hoursCount: number = 24;
  totalPoints: number = 0;
  idUser: number | null = null;
  username: string | null | undefined = null; // Nom d'utilisateur récupéré via l'API

  constructor(private router: Router,
              private tokenService: TokenService,
              private tokenDecodeService: TokenDecodeService,
              private userControllerService: UserControllerService,
              private friendshipControllerService: FriendshipControllerService,
              private userAchievementControllerService: UserAchievementControllerService,
              private gameProgressControllerService: GameProgressControllerService) { }

  goToHome() {
    this.router.navigate(['/Home']);
  }
  goToEditerProfil() {
    this.router.navigate(['/EditerProfil']);
  }
  goToSocial() {
    this.router.navigate(['/Social']);
  }
  goToNotifications(){
    this.router.navigate(['/Notifications']);
  }

  // Implémente la déconnexion
  logout(): void {
    // Supprime le token
    this.tokenService.clearToken();
    // Redirige vers l'écran de connexion
    this.router.navigate(['/Connexion']); // Remplacez '/login' par la route exacte de la page de connexion
  }

  // Fonction dédiée à la gestion du nom d'utilisateur
  private handleUsernameRetrieval(): void {
    // Décodage du token pour récupérer l'ID utilisateur
    this.idUser = this.tokenDecodeService.getUserId();

    if (!this.idUser) {
      console.warn('ID utilisateur introuvable dans le token.');
      return;
    }
    // Appel à l'API pour récupérer les détails d'utilisateur
    this.userControllerService.getUserById({ userId: this.idUser }).subscribe({
      next: (user: UserDto) => {
        this.username = user.username; // Récupération du nom d'utilisateur
        console.log('Nom d’utilisateur récupéré:', this.username);
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération de l’utilisateur:', err);
      },
    });
  }

  // Méthode pour récupérer le nombre d'amis de l'utilisateur
  private handleFriendCountRetrieval(): void {
    if (!this.idUser) {
      console.warn('Impossible de récupérer le nombre d’amis : aucun ID utilisateur trouvé.');
      return;
    }

    this.friendshipControllerService.getFriendCount({ userId: this.idUser }).subscribe({
      next: (count: number) => {
        this.friendsCount = count; // Assigne le nombre d'amis
        console.log(`Nombre d'amis récupéré :`, this.friendsCount);
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération du nombre d’amis:', err);
      },
    });
  }

  // Méthode pour récupérer le total des points d'achievements de l'utilisateur
  private handleAchievementPointsRetrieval(): void {
    if (!this.idUser) {
      console.warn('Impossible de récupérer les points : aucun ID utilisateur trouvé.');
      return;
    }

    this.userAchievementControllerService.getTotalAchievementPoints({ userId: this.idUser }).subscribe({
      next: (points: number) => {
        this.totalPoints = points; // Assigne le total des points
        console.log(`Total des points d'achievements récupéré :`, this.totalPoints);
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des points d’achievements:', err);
      },
    });
  }

  // Méthode pour récupérer le temps total de jeu
  private handlePlaytimeRetrieval(): void {
    if (!this.idUser) {
      console.warn('Impossible de récupérer le temps de jeu : aucun ID utilisateur trouvé.');
      return;
    }

    this.gameProgressControllerService.getTotalPlaytimeForUser({ userId: this.idUser }).subscribe({
      next: (playtime: number) => {
        this.hoursCount = playtime;
        console.log('Temps total de jeu récupéré :', this.hoursCount);
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération du temps de jeu :', err);
      },
    });
  }

  // Initialisation des données au montage du composant
  ngOnInit(): void {
    this.handleUsernameRetrieval(); // Appel à la gestion du username
    this.handleFriendCountRetrieval();
    this.handleAchievementPointsRetrieval();
    this.handlePlaytimeRetrieval();
  }
}
