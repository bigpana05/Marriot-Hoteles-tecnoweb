import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FeaturedHotel } from '../../../../../core/models/featured-hotel.model';
import { HotelService } from '../../../../../core/services/hotel.service';

// Constantes para breakpoints responsive
const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 1024;
const BREAKPOINT_LAPTOP = 1200;

// Constantes para dimensiones de items
const ITEM_WIDTH_DESKTOP = 364;
const ITEM_WIDTH_TABLET_LANDSCAPE = 320;
const ITEM_WIDTH_TABLET = 300;
const ITEM_WIDTH_MOBILE = 280;
const CAROUSEL_GAP = 20;

/**
 * Componente para mostrar hoteles destacados en un carrusel responsive.
 * Muestra 3 hoteles en desktop, 2 en tablet y 1 en móvil.
 */
@Component({
  selector: 'app-home-featured-hotels',
  templateUrl: './home-featured-hotels.component.html',
  styleUrls: ['./home-featured-hotels.component.scss']
})
export class HomeFeaturedHotelsComponent implements OnInit, OnDestroy {

  featuredHotels: FeaturedHotel[] = [];
  loading = false;

  // Hoteles de fallback si no hay datos en DB
  private fallbackHotels: FeaturedHotel[] = [
    {
      id: 1,
      name: 'JW Marriott Venice Resort & Spa',
      city: 'Venice',
      country: 'ITALY',
      imageUrl: 'assets/brand/featured-hotels/Marriott_International-JW_Marriott_Venice_Resort-amp-SPA-JW_Facade-ref161796.jpg'
    },
    {
      id: 2,
      name: 'W Hotel Barcelona',
      city: 'Barcelona',
      country: 'SPAIN',
      imageUrl: 'assets/brand/featured-hotels/Marriott_International-W_Hotel_Barcelona-ref163110.jpg'
    },
    {
      id: 3,
      name: 'Le Royal Meridien Doha',
      city: 'Doha',
      country: 'QATAR',
      imageUrl: 'assets/brand/featured-hotels/Marriott_International-Le_Royal_Meridien_Doha-Exterior-ref163191.jpg'
    }
  ];

  currentSlide = 0;
  itemsPerSlide = 3;
  itemWidth = ITEM_WIDTH_DESKTOP;
  gap = CAROUSEL_GAP;

  private resizeListener: () => void;

  constructor(
    private hotelService: HotelService,
    private router: Router
  ) {
    this.resizeListener = () => this.checkScreenSize();
  }

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', this.resizeListener);
    this.loadFeaturedHotels();
  }

  /**
   * Carga los hoteles destacados desde db.json
   */
  loadFeaturedHotels(): void {
    this.loading = true;
    this.hotelService.getActiveHotels().subscribe({
      next: (hotels) => {
        if (hotels && hotels.length > 0) {
          // Convertir hoteles a FeaturedHotel
          this.featuredHotels = hotels.map(h => ({
            id: typeof h.id === 'string' ? parseInt(h.id, 10) : (h.id || 0),
            name: h.name,
            city: h.location?.city || '',
            country: h.location?.country?.toUpperCase() || '',
            imageUrl: h.images?.[0] || 'assets/brand/featured-hotels/default-hotel.jpg'
          }));

          // Duplicar para el carrusel si hay pocos hoteles
          if (this.featuredHotels.length < 3) {
            const original = [...this.featuredHotels];
            while (this.featuredHotels.length < 6) {
              original.forEach(h => {
                this.featuredHotels.push({
                  ...h,
                  id: this.featuredHotels.length + 1
                });
              });
            }
          }
        } else {
          // Usar fallback si no hay hoteles
          this.featuredHotels = [...this.fallbackHotels, ...this.fallbackHotels];
        }
        this.loading = false;
      },
      error: () => {
        // Usar fallback en caso de error
        this.featuredHotels = [...this.fallbackHotels, ...this.fallbackHotels];
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }

  /**
   * Ajusta el número de items visibles y su tamaño según el ancho de pantalla.
   */
  checkScreenSize(): void {
    const width = window.innerWidth;

    if (width < BREAKPOINT_MOBILE) {
      this.itemsPerSlide = 1;
      this.itemWidth = ITEM_WIDTH_MOBILE;
    } else if (width <= BREAKPOINT_TABLET) {
      this.itemWidth = ITEM_WIDTH_TABLET_LANDSCAPE;
      this.itemsPerSlide = 2;
    } else if (width <= BREAKPOINT_LAPTOP) {
      this.itemWidth = ITEM_WIDTH_DESKTOP;
      this.itemsPerSlide = 2;
    } else {
      this.itemWidth = ITEM_WIDTH_DESKTOP;
      this.itemsPerSlide = 3;
    }

    if (this.currentSlide >= this.totalSlides) {
      this.currentSlide = 0;
    }
  }

  /**
   * Calcula el estilo de transformación para el carrusel.
   * Se desplaza de 1 en 1 card.
   * @returns String con el valor CSS translateX.
   */
  get transformStyle(): string {
    if (this.itemsPerSlide === 1) {
      const percentShift = this.currentSlide * 100;
      return `translateX(-${percentShift}%)`;
    } else {
      const shift = this.currentSlide * (this.itemWidth + this.gap);
      return `translateX(-${shift}px)`;
    }
  }

  get totalSlides(): number {
    return this.featuredHotels.length - this.itemsPerSlide + 1;
  }

  get slides(): number[] {
    const slides = [];
    for (let i = 0; i < this.totalSlides; i++) {
      slides.push(i);
    }
    return slides;
  }

  /**
   * Avanza al siguiente grupo de hoteles en el carrusel.
   */
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  /**
   * Retrocede al grupo anterior de hoteles en el carrusel.
   */
  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
  }

  /**
   * Navega a un slide específico del carrusel.
   * @param index Índice del slide al que se desea navegar.
   */
  goToSlide(index: number): void {
    this.currentSlide = index;
  }
  /**
   * Navega a la búsqueda con el nombre del hotel seleccionado y fechas predeterminadas (hoy - mañana)
   */
  onHotelClick(hotel: FeaturedHotel): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Formatear fechas manualmente (YYYY-MM-DD)
    const checkIn = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const checkOut = `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;

    // Destino completo
    const destination = `${hotel.name}, ${hotel.city}, ${hotel.country}`;

    this.router.navigate(['/client/search-hotels'], {
      queryParams: {
        destination: destination,
        checkIn: checkIn,
        checkOut: checkOut
      }
    });
  }
}
