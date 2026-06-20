import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { GameControllerService } from '../../api/services/game-controller.service';
import { Game } from '../../api/models/game';

@Component({
  selector: 'app-ecran-jeu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ecran-jeu.component.html',
  styleUrl: './ecran-jeu.component.scss'
})
export class EcranJeuComponent implements OnInit {
  game: Game | undefined;
  loading = true;
  error: string | null = null;
  safeGameUrl: SafeResourceUrl | undefined;

  constructor(
    private route: ActivatedRoute,
    private gameControllerService: GameControllerService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const gameName = params['name'];

      if (!gameName) {
        this.loading = false;
        this.error = 'Nom du jeu non spécifié';
        return;
      }

      this.gameControllerService.getGamesByName({ name: gameName }).subscribe({
        next: (games: Game[]) => {
          this.game = games.length > 0 ? games[0] : undefined;

          if (!this.game) {
            this.error = 'Jeu introuvable';
          } else if (this.game.url) {
            this.safeGameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.game.url);
          }

          this.loading = false;
        },
        error: (error: unknown) => {
          console.error('Erreur:', error);
          this.loading = false;
          this.error = 'Erreur lors du chargement du jeu';
        }
      });
    });
  }
}
