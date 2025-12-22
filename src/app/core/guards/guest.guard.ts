import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    UrlTree,
    Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class GuestGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        return this.authService.currentUser$.pipe(
            take(1),
            map((user) => {
                if (user) {
                    // Si el usuario ya está logueado, redirigir al home
                    return this.router.createUrlTree(['/']);
                }
                // Si no está logueado, permitir el acceso
                return true;
            })
        );
    }
}
