import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../pages/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminOrViewerGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Dashboard accessible aux admins ET viewers
    if (this.authService.isAdmin() || this.authService.isViewer()) {
      return true;
    } else {
      // Redirect élève to accueil
      if (this.authService.isEleve()) {
        this.router.navigate(['/accueil']);
      } else {
        this.router.navigate(['/auth']);
      }
      return false;
    }
  }
}
