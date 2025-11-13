import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../src/app/core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  user: User | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.auth.currentUser$.subscribe(u => (this.user = u));
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/client/home']);
  }
}

