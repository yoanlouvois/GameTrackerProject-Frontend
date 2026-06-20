import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UserDto } from '../../api/models/user-dto';
import { UserControllerService } from '../../api/services/user-controller.service';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-ecran-inscription',
  templateUrl: './ecran-inscription.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  styleUrls: ['./ecran-inscription.component.scss']
})
export class EcranInscriptionComponent {
  username = '';
  email = '';
  password = '';

  constructor(
    private userControllerService: UserControllerService,
    private router: Router
  ) {}

  createUser(): void {
    if (!this.username || !this.email || !this.password) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    const newUser: UserDto = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.userControllerService.createUser({ body: newUser }).subscribe({
      next: (response) => {
        console.log('Utilisateur créé avec succès :', response);
        alert('Inscription réussie ! Vous allez être redirigé vers la page de connexion.');
        this.router.navigate(['/Connexion']);
      },
      error: (err) => {
        console.error('Erreur lors de la création de l\'utilisateur :', err);

        if (err.status === 400) {
          alert('Champs invalides. Veuillez vérifier les informations saisies.');
        } else if (err.status === 500) {
          alert('Erreur serveur. Veuillez réessayer plus tard.');
        } else {
          alert('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    });
  }

  goToConnexion(): void {
    this.router.navigate(['/Connexion']);
  }

  goToAccueil(): void {
    this.router.navigate(['/Home']);
  }
}
