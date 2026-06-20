import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FriendshipControllerService, UserControllerService } from '../../api/services';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../services/token/token.service';
import { TokenDecodeService } from '../../services/token/token-decode.service';
import { MatButton, MatIconButton } from '@angular/material/button';
import {UserDto} from '../../api/models/user-dto';

/**
 * @component EcranAjouterAmiComponent
 * @description Ce composant permet à un utilisateur d'envoyer une demande d'amitié
 * en saisissant le pseudo de l'ami recherché.
 */
@Component({
  selector: 'app-ecran-ajouter-ami',
  templateUrl: './ecran-ajouter-ami.component.html',
  imports: [
    CommonModule,
    MatIcon,
    FormsModule,
    MatLabel,
    MatFormField,
    MatIconButton,
    MatButton,
    MatInput
  ],
  styleUrls: ['./ecran-ajouter-ami.component.scss']
})
export class EcranAjouterAmiComponent implements OnInit {
  /** Pseudo de l'ami entré par l'utilisateur */
  ami: string = "";

  /** ID de l'utilisateur connecté */
  private userId: number | null = null;

  constructor(
    private router: Router,
    private friendshipService: FriendshipControllerService,
    private userControllerService: UserControllerService, // Service pour récupérer un utilisateur par son pseudo
    private tokenService: TokenService,
    private tokenDecodeService: TokenDecodeService
  ) {}

  /**
   * @method ngOnInit
   * @description Récupère l'ID de l'utilisateur connecté à partir du token JWT.
   */
  ngOnInit(): void {
    this.userId = this.tokenDecodeService.getUserId();
    console.log('ID utilisateur extrait du token :', this.userId);
  }

  /**
   * @method envoyerDemandeAmi
   * @description Envoie une demande d'amitié à l'utilisateur correspondant au pseudo entré.
   * Vérifie d'abord la validité du pseudo, puis récupère l'ID utilisateur via l'API.
   * En cas de succès, une demande d'amitié est envoyée.
   */
  envoyerDemandeAmi() {
    // Vérifie que le pseudo n'est pas vide
    if (!this.ami.trim()) {
      alert("Veuillez entrer un pseudo valide.");
      return;
    }

    // Vérifie que l'utilisateur est bien connecté
    if (!this.userId) {
      alert("Impossible de récupérer votre identifiant utilisateur.");
      return;
    }

    // Étape 1 : Convertir le pseudo en ID utilisateur
    this.userControllerService.getUserByUsername({ username: this.ami }).subscribe({
      next: (user: UserDto) => {
        if (user && user.id) {
          const amiId = user.id; // ID de l'ami récupéré

          if (this.userId === null) {
            alert("Votre identifiant utilisateur est introuvable.");
            return;
          }

          const params = {
            senderId: this.userId as number, // ✅ Conversion sûre
            receiverId: amiId
          };

          // Étape 2 : Envoi de la demande d'amitié
          this.friendshipService.sendFriendRequest(params).subscribe({
            next: () => {
              alert(`Demande d'amitié envoyée à ${this.ami} (ID: ${amiId})!`);
              this.router.navigate(['/Social']); // Redirection après succès
            },
            error: (err: any) => {
              console.error('Erreur lors de l’envoi de la demande :', err);
              alert("Erreur lors de l’envoi de la demande d'amitié.");
            }
          });
        } else {
          alert(`Utilisateur "${this.ami}" introuvable.`);
        }
      },
      error: (err: any) => {
        console.error(`Erreur lors de la récupération de l'utilisateur :`, err);
        alert(`Erreur lors de la recherche de l'utilisateur "${this.ami}".`);
      }
    });
  }

  /**
   * @method goToSocial
   * @description Annule l'action et redirige l'utilisateur vers la page Social.
   */
  goToSocial() {
    this.router.navigate(['/Social']);
  }
}
