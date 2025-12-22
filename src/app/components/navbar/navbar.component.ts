import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

/**
 * NavbarComponent
 * 
 * Gestiona la barra de navegación principal de la aplicación.
 * 
 * Responsabilidades:
 * - Mostrar/ocultar menú hamburguesa en mobile y tablet
 * - Gestionar selector de idioma (con dropdown)
 * - Proporcionar enlaces de navegación y autenticación
 * - Botón de reserva
 * 
 * Propiedades reactivas:
 * - isMenuOpen: Estado del menú móvil
 * - isLangMenuOpen: Estado del dropdown de idioma
 * - currentLang: Idioma actual seleccionado
 */
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  /** Indica si el menú móvil está abierto */
  isMenuOpen = false;

  /** Indica si el dropdown de usuario está abierto */
  isUserDropdownOpen = false;

  /** Usuario autenticado actual (o null si invitado) */
  user: User | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.auth.currentUser$.subscribe(u => (this.user = u));
  }

  /**
   * Cierra sesión y redirige al home del cliente
   */
  logout(): void {
    this.isUserDropdownOpen = false;
    this.auth.logout();
    this.router.navigate(['/client/home']);
  }

  /**
   * Abre/cierra el menú hamburguesa móvil
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * Cierra el menú hamburguesa móvil
   */
  closeMenu(): void {
    this.isMenuOpen = false;
  }

  /**
   * Abre/cierra el dropdown de usuario
   */
  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  /**
   * Cierra el dropdown de usuario
   */
  closeUserDropdown(): void {
    this.isUserDropdownOpen = false;
  }
}
