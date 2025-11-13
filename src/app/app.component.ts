import { Component } from '@angular/core';
<<<<<<< HEAD
import { Router } from '@angular/router';
=======
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
<<<<<<< HEAD
  title = 'Marriot-Hoteles-tecnoweb';

  constructor(private router: Router) {}

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}

=======
  // Título de la aplicación visible en metadatos/tests. Reemplazado por un nombre más descriptivo.
  title = 'Marriot Hoteles';
}
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
