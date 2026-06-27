import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { GameCommentControllerService } from '../../api/services/game-comment-controller.service';
import { GameCommentDto } from '../../api/models/game-comment-dto';
import { TokenService } from '../../services/token/token.service';

import { GameControllerService } from '../../api/services/game-controller.service';
import { Game } from '../../api/models/game';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-ecran-jeu',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ecran-jeu.component.html',
  styleUrl: './ecran-jeu.component.scss'
})
export class EcranJeuComponent implements OnInit {
  game: Game | undefined;
  loading = true;
  error: string | null = null;
  safeGameUrl: SafeResourceUrl | undefined;
  comments: GameCommentDto[] = [];
  newCommentContent = '';
  isLoggedIn = false;
  connectedUserId: number | null = null;
  editingCommentId: number | null = null;
  editedCommentContent = '';
  replyingToCommentId: number | null = null;
  replyContent = '';

  repliesByCommentId: { [commentId: number]: GameCommentDto[] } = {};

  constructor(
    private route: ActivatedRoute,
    private gameControllerService: GameControllerService,
    private sanitizer: DomSanitizer,
    private commentService: GameCommentControllerService,
    private tokenService: TokenService,
    @Inject(PLATFORM_ID) private platformId: Object
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

          if (isPlatformBrowser(this.platformId)) {
            const token = this.tokenService.token;
            this.isLoggedIn = !!token;
            this.connectedUserId = token ? this.getUserIdFromToken(token) : null;
          }

          this.loadComments();
        },
        error: (error: unknown) => {
          console.error('Erreur:', error);
          this.loading = false;
          this.error = 'Erreur lors du chargement du jeu';
        }
      });
    });

  }

  loadComments(): void {
    if (!this.game?.id) return;

    this.commentService.getCommentsForGame({
      gameId: this.game.id,
      pageable: {
        page: 0,
        size: 20,
        sort: ['creationDate,desc']
      }
    }).subscribe({
      next: (page) => {
        this.comments = page.content ?? [];
      },
      error: (err) => {
        console.error('Erreur chargement commentaires', err);
      }
    });
  }

  addComment(): void {
    if (!this.connectedUserId || !this.newCommentContent.trim()) return;

    this.commentService.createComment({
      body: {
        content: this.newCommentContent,
        user: {
          id: this.connectedUserId
        }
      }
    }).subscribe({
      next: () => {
        this.newCommentContent = '';
        this.loadComments();
      },
      error: (err) => console.error('Erreur ajout commentaire', err)
    });
  }

  startEdit(comment: GameCommentDto): void {
    this.editingCommentId = comment.id ?? null;
    this.editedCommentContent = comment.content ?? '';
  }

  updateComment(commentId: number | undefined): void {
    if (!commentId || !this.editedCommentContent.trim()) return;

    this.commentService.updateCommentContent({
      commentId,
      body: this.editedCommentContent
    }).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadComments();
      },
      error: (err) => console.error('Erreur modification commentaire', err)
    });
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editedCommentContent = '';
  }

  deleteComment(commentId: number | undefined): void {
    if (!commentId) return;

    this.commentService.deleteComment({
      commentId
    }).subscribe({
      next: () => this.loadComments(),
      error: (err) => console.error('Erreur suppression commentaire', err)
    });
  }

  toggleReply(commentId: number | undefined): void {
    if (!commentId) return;
    this.replyingToCommentId = this.replyingToCommentId === commentId ? null : commentId;
    this.replyContent = '';
  }

  loadReplies(commentId: number | undefined): void {
    if (!commentId) return;

    this.commentService.getCommentReplies({
      parentCommentId: commentId,
      pageable: {
        page: 0,
        size: 10,
        sort: ['creationDate,asc']
      }
    }).subscribe({
      next: (page) => {
        this.repliesByCommentId[commentId] = page.content ?? [];
      },
      error: (err) => console.error('Erreur chargement réponses', err)
    });
  }

  isMyComment(comment: GameCommentDto): boolean {
    return !!this.connectedUserId && comment.user?.id === this.connectedUserId;
  }

  addReply(parentCommentId: number | undefined): void {
    if (!parentCommentId || !this.connectedUserId || !this.replyContent.trim()) return;

    this.commentService.addReplyToComment({
      parentCommentId,
      body: {
        content: this.replyContent,
        user: {
          id: this.connectedUserId
        }
      }
    }).subscribe({
      next: () => {
        this.replyContent = '';
        this.replyingToCommentId = null;
        this.loadReplies(parentCommentId);
      },
      error: (err) => console.error('Erreur réponse commentaire', err)
    });
  }

  private getUserIdFromToken(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ?? payload.id ?? null;
    } catch {
      return null;
    }
  }
}
