import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../pages/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminOrEleveGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Accueil et Form accessibles aux admins ET élèves
    if (this.authService.isAdmin() || this.authService.isEleve()) {
      return true;
    } else {
      // Redirect viewer to dashboard
      if (this.authService.isViewer()) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/auth']);
      }
      return false;
    }
  }
}
