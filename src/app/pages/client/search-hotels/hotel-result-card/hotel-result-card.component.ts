import { Component, Input } from '@angular/core';
import { HotelSearchResult } from '../../../../core/models/hotel-search.model';

/**
 * Componente de tarjeta de resultado de hotel
 * Muestra información del hotel con carrusel de imágenes y panel de detalles desplegable
 */
@Component({
  selector: 'app-hotel-result-card',
  templateUrl: './hotel-result-card.component.html',
  styleUrls: ['./hotel-result-card.component.scss']
})
export class HotelResultCardComponent {
  @Input() hotel!: HotelSearchResult;
  @Input() numberOfNights: number = 1;

  // Estado del carrusel de imágenes
  currentImageIndex = 0;

  // Estado del panel de detalles
  showDetails = false;

  // Imagen principal seleccionada en la galería
  selectedGalleryImage = 0;

  /**
   * Obtiene la imagen actual del carrusel
   */
  get currentImage(): string {
    return this.hotel?.images[this.currentImageIndex] || '';
  }

  /**
   * Navega a la imagen anterior del carrusel
   */
  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.hotel.images.length - 1;
    }
  }

  /**
   * Navega a la siguiente imagen del carrusel
   */
  nextImage(): void {
    if (this.currentImageIndex < this.hotel.images.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0;
    }
  }

  /**
   * Navega a una imagen específica del carrusel
   * @param index - Índice de la imagen
   */
  goToImage(index: number): void {
    this.currentImageIndex = index;
  }

  /**
   * Toggle del panel de detalles
   */
  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  /**
   * Cierra el panel de detalles
   */
  closeDetails(): void {
    this.showDetails = false;
  }

  /**
   * Selecciona una imagen de la galería
   * @param index - Índice de la imagen
   */
  selectGalleryImage(index: number): void {
    this.selectedGalleryImage = index;
  }

  /**
   * Obtiene el texto de la distancia
   */
  get distanceText(): string {
    if (this.hotel.distanceFromDestination === 0) {
      return '0 km desde el destino';
    }
    return `${this.hotel.distanceFromDestination} km desde el destino`;
  }

  /**
   * Obtiene el texto de las opiniones
   */
  get reviewsText(): string {
    return `(${this.hotel.reviewCount.toLocaleString('es-ES')} opiniones)`;
  }

  /**
   * Formatea el precio por noche
   */
  get formattedPrice(): string {
    return `${this.hotel.pricePerNight} ${this.hotel.currency}`;
  }

  /**
   * Obtiene el ícono de una comodidad
   * @param iconName - Nombre del ícono
   */
  getAmenityIcon(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      wifi: 'assets/icons/wifi.svg',
      pool: 'assets/icons/pool.svg',
      gym: 'assets/icons/gym.svg',
      breakfast: 'assets/icons/breakfast.svg',
      pets: 'assets/icons/pets.svg',
      spa: 'assets/icons/spa.svg',
      events: 'assets/icons/events.svg',
      accessible: 'assets/icons/accessible.svg',
      tea: 'assets/icons/tea.svg'
    };
    return iconMap[iconName] || 'assets/icons/check.svg';
  }

  /**
   * Maneja el click en Ver Tarifas
   * Por ahora no hace nada, después navegará a reservas
   */
  onViewRates(): void {
    // TODO: Implementar navegación a página de reservas
    console.log('Ver tarifas del hotel:', this.hotel.id);
  }
}
