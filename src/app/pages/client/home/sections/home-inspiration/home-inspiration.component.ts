import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Destination } from '../../../../../core/models/destination.model';

// Constantes para breakpoints responsive
const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 1024;
const BREAKPOINT_DESKTOP = 1441;
const BREAKPOINT_LARGE = 1921;

// Constantes para dimensiones de items
const ITEM_WIDTH_ULTRA_LARGE = 680;
const ITEM_WIDTH_LARGE = 588;
const ITEM_WIDTH_DESKTOP = 558;
const ITEM_WIDTH_TABLET = 320;
const ITEM_WIDTH_TABLET_SMALL = 300;
const ITEM_WIDTH_MOBILE = 320;
const CAROUSEL_GAP = 20;

/**
 * Componente para mostrar destinos inspiradores en un carrusel responsive.
 * Muestra 2 destinos en desktop/tablet y 1 en móvil.
 */
@Component({
  selector: 'app-home-inspiration',
  templateUrl: './home-inspiration.component.html',
  styleUrls: ['./home-inspiration.component.scss']
})
export class HomeInspirationComponent implements OnInit, OnDestroy {

  destinations: Destination[] = [
    {
      id: 1,
      name: 'Dubái',
      imageUrl: 'assets/brand/destinations/dubai.jpg'
    },
    {
      id: 2,
      name: 'París, Francia',
      imageUrl: 'assets/brand/destinations/paris-france.jpg'
    },
    {
      id: 3,
      name: 'Alemania, Múnich',
      imageUrl: 'assets/brand/destinations/germany-munich.jpg'
    },
    {
      id: 4,
      name: 'Italia',
      imageUrl: 'assets/brand/destinations/italy.jpg'
    }
  ];

  currentSlide = 0;
  itemsPerSlide = 2;
  itemWidth = ITEM_WIDTH_DESKTOP;
  gap = CAROUSEL_GAP;

  private resizeListener: () => void;

  constructor(private router: Router) {
    this.resizeListener = () => this.checkScreenSize();
  }

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }

  /**
   * Navega a la búsqueda de hoteles para el destino seleccionado
   * @param destination Destino seleccionado
   */
  exploreDestination(destination: Destination): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkIn = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const checkOut = `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;

    let searchDestination = destination.name;
    // Mapeo de nombres para mejorar la precisión de búsqueda
    if (searchDestination === 'Dubái') {
      searchDestination = 'Dúbai, Emiratos Árabes Unidos';
    } else if (searchDestination === 'Alemania, Múnich') {
      searchDestination = 'Múnich, Alemania';
    }

    this.router.navigate(['/client/search-hotels'], {
      queryParams: {
        destination: searchDestination,
        checkIn: checkIn,
        checkOut: checkOut,
        rooms: 1,
        adults: 1,
        children: 0
      }
    });
  }

  /**
   * Ajusta el número de items visibles y su tamaño según el ancho de pantalla.
   */
  checkScreenSize(): void {
    const width = window.innerWidth;

    if (width < BREAKPOINT_MOBILE) {
      this.itemsPerSlide = 1;
      this.itemWidth = ITEM_WIDTH_MOBILE;
    } else if (width === BREAKPOINT_MOBILE) {
      this.itemWidth = ITEM_WIDTH_TABLET_SMALL;
      this.itemsPerSlide = 2;
    } else if (width <= BREAKPOINT_TABLET) {
      this.itemWidth = ITEM_WIDTH_TABLET;
      this.itemsPerSlide = 2;
    } else if (width <= BREAKPOINT_DESKTOP) {
      this.itemWidth = ITEM_WIDTH_DESKTOP;
      this.itemsPerSlide = 2;
    } else if (width <= BREAKPOINT_LARGE) {
      this.itemWidth = ITEM_WIDTH_LARGE;
      this.itemsPerSlide = 2;
    } else {
      this.itemWidth = ITEM_WIDTH_ULTRA_LARGE;
      this.itemsPerSlide = 2;
    }

    if (this.currentSlide >= this.totalSlides) {
      this.currentSlide = 0;
    }
  }

  /**
   * Calcula el estilo de transformación para el carrusel.
   * Se desplaza de 1 en 1 card.
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

  /**
   * Calcula el número total de slides disponibles.
   */
  get totalSlides(): number {
    return this.destinations.length - this.itemsPerSlide + 1;
  }

  /**
   * Genera un array de índices para los dots del carrusel.
   */
  get slides(): number[] {
    const slides = [];
    for (let i = 0; i < this.totalSlides; i++) {
      slides.push(i);
    }
    return slides;
  }

  /**
   * Avanza al siguiente destino en el carrusel.
   */
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  /**
   * Retrocede al destino anterior en el carrusel.
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
}
