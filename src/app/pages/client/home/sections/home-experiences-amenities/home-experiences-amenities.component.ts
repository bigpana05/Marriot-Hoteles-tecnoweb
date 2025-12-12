import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExperienceAmenity } from '../../../../../core/models/experience-amenity.model';

// Constantes para breakpoints responsive
const BREAKPOINT_MOBILE = 300; // Cambiado para que 320px, 375px y 425px muestren 3 cards
const BREAKPOINT_TABLET = 1024;
const BREAKPOINT_LAPTOP = 1440;

// Constantes para animación
const ANIMATION_DURATION = 500;

/**
 * Componente para mostrar experiencias y amenidades en un carrusel.
 * Muestra 1 card grande + 2 pequeñas en desktop y móvil (320px+).
 * Layout responsive con botones de navegación y animaciones suaves.
 */
@Component({
  selector: 'app-home-experiences-amenities',
  templateUrl: './home-experiences-amenities.component.html',
  styleUrls: ['./home-experiences-amenities.component.scss']
})
export class HomeExperiencesAmenitiesComponent implements OnInit, OnDestroy {

  experiences: ExperienceAmenity[] = [
    {
      id: 1,
      title: 'Spa y Bienestar',
      description: 'Relájate con tratamientos de spa premium diseñados para restaurar cuerpo y mente.',
      imageUrl: 'assets/brand/experiences-amenities/spa-y-wellness.jpg'
    },
    {
      id: 2,
      title: 'Experiencias Gastronómicas',
      description: 'Disfruta experiencias culinarias elevadas con sabores locales e internacionales.',
      imageUrl: 'assets/brand/experiences-amenities/dinning-experiences.jpg'
    },
    {
      id: 3,
      title: 'Centro de Fitness',
      description: 'Espacios de fitness modernos y completamente equipados para tu rutina diaria.',
      imageUrl: 'assets/brand/experiences-amenities/fitness-center.jpg'
    },
    {
      id: 4,
      title: 'Spa y Bienestar',
      description: 'Relájate con tratamientos de spa premium diseñados para restaurar cuerpo y mente.',
      imageUrl: 'assets/brand/experiences-amenities/spa-y-wellness-2.jpg'
    },
    {
      id: 5,
      title: 'Experiencias Gastronómicas',
      description: 'Disfruta experiencias culinarias elevadas con sabores locales e internacionales.',
      imageUrl: 'assets/brand/experiences-amenities/dinning-experiences-2.jpg'
    },
    {
      id: 6,
      title: 'Centro de Fitness',
      description: 'Espacios de fitness modernos y completamente equipados para tu rutina diaria.',
      imageUrl: 'assets/brand/experiences-amenities/fitness-center-2.jpg'
    }
  ];

  currentIndex = 0;
  isAnimating = false;
  isMobileLayout = false;

  private resizeListener: () => void;

  constructor() {
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
   * Ajusta el layout según el ancho de pantalla.
   */
  checkScreenSize(): void {
    const width = window.innerWidth;
    this.isMobileLayout = width < BREAKPOINT_MOBILE;
  }

  /**
   * Obtiene las experiencias visibles según el índice actual.
   * Retorna 3 items en desktop (1 grande + 2 pequeñas) o 2 en móvil (1 grande + 1 pequeña).
   */
  get visibleExperiences(): ExperienceAmenity[] {
    const count = this.isMobileLayout ? 2 : 3;
    const visible: ExperienceAmenity[] = [];

    for (let i = 0; i < count; i++) {
      const index = (this.currentIndex + i) % this.experiences.length;
      visible.push(this.experiences[index]);
    }

    return visible;
  }

  /**
   * Obtiene el total de slides disponibles.
   */
  get totalSlides(): number {
    return this.experiences.length;
  }

  /**
   * Genera array de índices para los indicadores.
   */
  get slides(): number[] {
    return Array.from({ length: this.totalSlides }, (_, i) => i);
  }

  /**
   * Avanza al siguiente grupo de experiencias con animación.
   */
  nextSlide(): void {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.currentIndex = (this.currentIndex + 1) % this.experiences.length;

    setTimeout(() => {
      this.isAnimating = false;
    }, ANIMATION_DURATION);
  }

  /**
   * Retrocede al grupo anterior de experiencias con animación.
   */
  prevSlide(): void {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.currentIndex = (this.currentIndex - 1 + this.experiences.length) % this.experiences.length;

    setTimeout(() => {
      this.isAnimating = false;
    }, ANIMATION_DURATION);
  }

  /**
   * Navega a un slide específico.
   * @param index Índice del slide.
   */
  goToSlide(index: number): void {
    if (this.isAnimating || index === this.currentIndex) return;

    this.isAnimating = true;
    this.currentIndex = index;

    setTimeout(() => {
      this.isAnimating = false;
    }, ANIMATION_DURATION);
  }
}
