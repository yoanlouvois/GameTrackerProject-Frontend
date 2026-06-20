import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';

import { AuthenticationRequest } from '../../api/models/authentication-request';
import { AuthenticationControllerService } from '../../api/services/authentication-controller.service';
import { TokenService } from '../../services/token/token.service';

@Component({
  selector: 'app-ecran-connexion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatIcon,
    MatLabel,
    MatFormField,
    MatIconButton,
    MatInput,
    MatButton,
    NgIf,
    CommonModule
  ],
  templateUrl: './ecran-connexion.component.html',
  styleUrl: './ecran-connexion.component.scss'
})
export class EcranConnexionComponent {
  authRequest: AuthenticationRequest = { login: '', password: '' };
  errorMsg: string[] = [];

  constructor(
    private router: Router,
    private authService: AuthenticationControllerService,
    private tokenService: TokenService
  ) {}

  goToInscription(): void {
    this.router.navigate(['/Inscription']);
  }

  goToAccueil(): void {
    this.router.navigate(['/Home']);
  }

  login(): void {
    this.errorMsg = [];

    this.authService.authenticate({
      body: this.authRequest
    }).subscribe({
      next: async (res) => {
        console.log('Réponse de l\'API :', res);

        const authResponse = res instanceof Blob
          ? JSON.parse(await res.text())
          : res;

        if (!authResponse.accessToken) {
          this.errorMsg.push('Token absent dans la réponse du serveur.');
          return;
        }

        this.tokenService.token = authResponse.accessToken;
        console.log('Token après stockage :', this.tokenService.token);

        this.router.navigate(['/Profil']);
      },
      error: (err: any) => {
        console.error(err);

        if (err.error?.validationErrors) {
          this.errorMsg = err.error.validationErrors;
        } else if (err.error?.errorMsg) {
          this.errorMsg.push(err.error.errorMsg);
        } else {
          this.errorMsg.push('Erreur lors de la connexion.');
        }
      }
    });
  }
}
