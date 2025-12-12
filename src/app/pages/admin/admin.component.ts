import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  user: User | null = null;

  constructor(private auth: AuthService, private router: Router) {
    this.auth.currentUser$.subscribe(u => (this.user = u));
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/client/login']);
  }
}
