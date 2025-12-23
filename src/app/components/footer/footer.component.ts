import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FeaturedHotel } from '../../core/models/featured-hotel.model';
import { HotelService } from '../../core/services/hotel.service';

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

  constructor(
    private hotelService: HotelService,
    private router: Router
  ) { }

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
   * Carga los hoteles reales desde HotelService.
   */
  private loadFeaturedHotels(): void {
    this.hotelService.getActiveHotels().subscribe({
      next: (hotels) => {
        if (hotels && hotels.length > 0) {
          // Tomar hasta 8 hoteles para no saturar el footer
          const hotelsToShow = hotels.slice(0, 8);

          this.featuredHotels = hotelsToShow.map(h => ({
            id: typeof h.id === 'string' ? parseInt(h.id, 10) : (h.id || 0),
            name: h.name,
            city: h.location?.city || '',
            country: h.location?.country?.toUpperCase() || '',
            imageUrl: h.images?.[0] || 'assets/brand/featured-hotels/default-hotel.jpg'
          }));
        }
      },
      error: (err) => {
        console.error('Error cargando hoteles para el footer', err);
      }
    });
  }

  /**
   * Navega a la búsqueda de hoteles preconfigurada con el hotel seleccionado.
   */
  searchHotel(hotel: FeaturedHotel): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Formatear fechas manualmente (YYYY-MM-DD)
    const checkIn = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const checkOut = `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;

    // Construir texto de búsqueda (Nombre, Ciudad, País)
    const searchTerm = `${hotel.name}, ${hotel.city}, ${hotel.country}`;

    this.router.navigate(['/client/search-hotels'], {
      queryParams: {
        destination: searchTerm,
        checkIn: checkIn,
        checkOut: checkOut,
        adults: 2,
        rooms: 1
      }
    });
  }

}
