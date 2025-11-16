import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Marriot-Hoteles-tecnoweb';

  constructor(private router: Router) {}

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
