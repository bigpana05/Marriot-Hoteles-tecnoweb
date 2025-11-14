import { Component } from '@angular/core';

/**
 * NavbarComponent
 * 
 * Gesiona la barra de navegación principal de la aplicación.
 * 
 * Responsabilidades:
 * - Mostrar/ocultar menú hamburguesa en mobile y tablet
 * - Gestionar selector de idioma (con dropdown)
 * - Proporcionar enlace s de navegación y autenticación
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

  /** Indica si el menú de idioma está abierto */
  isLangMenuOpen = false;

  /** Idioma actual seleccionado: 'en' (English) o 'es' (Español) */
  currentLang = 'en';

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

