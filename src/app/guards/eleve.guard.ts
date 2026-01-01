import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../pages/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EleveGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Élève peut accéder à: accueil, form, profile
    if (this.authService.isEleve()) {
      return true;
    } else {
      // Redirect to appropriate page based on role
      if (this.authService.isAdmin()) {
        this.router.navigate(['/dashboard']);
      } else if (this.authService.isViewer()) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/auth']);
      }
      return false;
    }
  }
}
