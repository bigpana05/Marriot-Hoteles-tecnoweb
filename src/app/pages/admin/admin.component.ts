import { Component } from '@angular/core';
<<<<<<< HEAD
import { Router } from '@angular/router';
import { AuthService, User } from '../../src/app/core/services/auth.service';
=======
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
<<<<<<< HEAD
  user: User | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    // Nos suscribimos al usuario actual para mostrar nombre y rol en el panel
    this.auth.currentUser$.subscribe(u => (this.user = u));
  }

  logout(): void {
    this.auth.logout();
    // Al cerrar sesión volvemos a la home pública
    this.router.navigate(['/client/home']);
  }

  goToClient(): void {
    // Ir a la vista pública (cliente)
    this.router.navigate(['/client/home']);
  }
=======

>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
}
