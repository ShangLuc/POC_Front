import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../pages/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ViewerGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Viewer peut accéder à: dashboard, profile
    if (this.authService.isViewer()) {
      return true;
    } else {
      // Redirect to appropriate page based on role
      if (this.authService.isAdmin()) {
        this.router.navigate(['/dashboard']);
      } else if (this.authService.isEleve()) {
        this.router.navigate(['/accueil']);
      } else {
        this.router.navigate(['/auth']);
      }
      return false;
    }
  }
}
