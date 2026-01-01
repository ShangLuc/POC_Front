import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../pages/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RequireAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // If user is authenticated, allow access
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    // If not authenticated, redirect to auth page
    this.router.navigate(['/auth']);
    return false;
  }
}
