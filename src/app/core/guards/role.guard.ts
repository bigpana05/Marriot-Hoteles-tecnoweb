import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expectedRole = route.data['role'] as UserRole | undefined;

    if (expectedRole && this.auth.isAuthenticated() && this.auth.hasRole(expectedRole)) {
      return true;
    }

    return this.router.parseUrl('/client/login');
  }
}
