import { Component } from '@angular/core';
import { Router } from '@angular/router';
// Update the import path to the correct location of auth.service.ts
import { AuthService, User } from '../../src/app/core/services/auth.service';

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
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  /** Indica si el menú móvil está abierto */
  isMenuOpen = false;

  /** Indica si el menú de idioma está abierto */
  isLangMenuOpen = false;

  /** Idioma actual seleccionado: 'en' (English) o 'es' (Español) */
  currentLang = 'en';

  /** Usuario autenticado actual (o null si invitado) */
  user: User | null = null;

  constructor(private auth: AuthService, private router: Router) {
    this.auth.currentUser$.subscribe((u) => (this.user = u));
  }

  /**
   * Cierra sesión y redirige al home del cliente
   */
  logout(): void {
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
   * Abre/cierra el dropdown de selector de idioma
   */
  toggleLangMenu(): void {
    this.isLangMenuOpen = !this.isLangMenuOpen;
  }

  /**
   * Cierra el dropdown de selector de idioma
   */
  closeLangMenu(): void {
    this.isLangMenuOpen = false;
  }

  /**
   * Cambia el idioma seleccionado
   * @param lang Código de idioma: 'en' o 'es'
   *
   * TODO: Integrar con LanguageService para cambiar idioma global en toda la aplicación
   */
  selectLanguage(lang: string): void {
    this.currentLang = lang;
    this.isLangMenuOpen = false;
    console.log('Idioma seleccionado:', lang);

    // Próximamente: this.languageService.setLanguage(lang);
  }
}
