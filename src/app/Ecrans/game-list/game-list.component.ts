import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameControllerService } from '../../api/services/game-controller.service';
import { GameDto } from '../../api/models/game-dto';
import { GameCardComponent } from '../game-card/game-card.component';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, GameCardComponent],
  templateUrl: './game-list.component.html',
  styleUrl: './game-list.component.scss'
})
export class GameListComponent implements OnInit {
  games: GameDto[] = [];
  loading = true;

  constructor(private gameControllerService: GameControllerService) {}

  ngOnInit(): void {
    this.gameControllerService.getAllGames({
      pageable: {
        page: 0,
        size: 100,
        sort: ['name,asc']
      }
    }).subscribe({
      next: (pageData) => {
        this.games = pageData.content ?? [];
        this.loading = false;
        console.log('Jeux chargés :', this.games);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des jeux', error);
        this.games = [];
        this.loading = false;
      }
    });
  }
}
