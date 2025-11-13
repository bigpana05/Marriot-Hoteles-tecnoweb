import { Component } from '@angular/core';
<<<<<<< HEAD
import { Router } from '@angular/router';
import { AuthService, User } from '../../../src/app/core/services/auth.service';
=======
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
<<<<<<< HEAD
  user: User | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.auth.currentUser$.subscribe(u => (this.user = u));
  }

  get isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/client/login']);
  }
=======

>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
}
