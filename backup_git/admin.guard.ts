import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    // TODO: brancher sur une vraie logique d'authentification admin.
    // Pour l'instant on laisse passer tout le monde.
    return true;
  }
}
