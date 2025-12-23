import { Component, OnInit } from '@angular/core';

import { FeaturedHotel } from '../../core/models/featured-hotel.model';

/**
 * Componente footer con enlaces de empresa, principales destinos y redes sociales.
 */
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  /** Controla la visibilidad del dropdown de Principales Destinos */
  isDestinationsOpen = false;

  /** Lista de hoteles destacados para mostrar en Principales Destinos */
  featuredHotels: FeaturedHotel[] = [];

  /** Controla la visibilidad de cada sección del footer en móvil */
  openSections: { [key: string]: boolean } = {
    company: false,
    work: false,
    help: false,
    privacy: false
  };

  ngOnInit(): void {
    this.loadFeaturedHotels();
  }

  /**
   * Alterna la visibilidad de la sección de Principales Destinos.
   */
  toggleDestinations(): void {
    this.isDestinationsOpen = !this.isDestinationsOpen;
  }

  /**
   * Alterna la visibilidad de una sección del footer en vista móvil.
   */
  toggleSection(section: string): void {
    this.openSections[section] = !this.openSections[section];
  }

  /**
   * Carga los hoteles destacados para la sección de Principales Destinos.
   * Usando datos estáticos por ahora hasta que se integre el servicio de hoteles.
   */
  private loadFeaturedHotels(): void {
    this.featuredHotels = [
      { id: 1, name: 'Marriott Santiago', city: 'Santiago', country: 'Chile', imageUrl: '' },
      { id: 2, name: 'Marriott Buenos Aires', city: 'Buenos Aires', country: 'Argentina', imageUrl: '' },
      { id: 3, name: 'Marriott Lima', city: 'Lima', country: 'Perú', imageUrl: '' }
    ];
  }

}
