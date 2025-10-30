import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated() || !this.authService.isTokenValid()) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return false;
    }

    const path = route.routeConfig?.path ?? '';
    if (!this.authService.canAccess(path)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
