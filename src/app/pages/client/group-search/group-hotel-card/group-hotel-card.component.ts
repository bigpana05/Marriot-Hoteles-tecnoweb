import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { GroupHotel, GroupHotelGallery, AVAILABLE_GROUP_EQUIPMENT } from '../../../../core/models/group-hotel.model';

@Component({
  selector: 'app-group-hotel-card',
  templateUrl: './group-hotel-card.component.html',
  styleUrls: ['./group-hotel-card.component.scss']
})
export class GroupHotelCardComponent {
  @Input() hotel: GroupHotel | null = null;
  @Input() searchParams: {
    checkIn: Date | null;
    checkOut: Date | null;
    rooms: number | null;
    attendees: number | null;
  } | null = null;
  @Output() selectHotel = new EventEmitter<GroupHotel>();

  // Carrusel
  currentImageIndex = 0;
  showDetails = false;

  // Galería
  selectedGalleryImage = 0;

  constructor(private router: Router) { }

  get currentImage(): string {
    return this.hotel?.images?.[this.currentImageIndex] || '';
  }

  get currentGallery(): GroupHotelGallery {
    return this.hotel?.galleries?.[this.selectedGalleryImage] || { imageUrl: '', label: '' };
  }

  // Carrusel methods
  prevImage(): void {
    if (!this.hotel?.images) return;
    this.currentImageIndex = this.currentImageIndex === 0
      ? this.hotel.images.length - 1
      : this.currentImageIndex - 1;
  }

  nextImage(): void {
    if (!this.hotel?.images) return;
    this.currentImageIndex = this.currentImageIndex === this.hotel.images.length - 1
      ? 0
      : this.currentImageIndex + 1;
  }

  goToImage(index: number): void {
    this.currentImageIndex = index;
  }

  // Detalles
  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  closeDetails(): void {
    this.showDetails = false;
  }

  // Galería
  selectGalleryImage(index: number): void {
    this.selectedGalleryImage = index;
  }

  // Amenidades disponibles
  getAvailableAmenities() {
    return this.hotel?.amenities?.filter(a => a.available) || [];
  }

  // Obtener label de categoría de equipamiento
  getEquipmentCategoryLabel(category: string): string {
    const cat = AVAILABLE_GROUP_EQUIPMENT.find(c => c.category === category);
    return cat ? cat.label : category;
  }

  // Obtener icono SVG para cada comodidad (mismo sistema que hoteles normales)
  getAmenityIcon(amenityId: string): string {
    const iconMap: { [key: string]: string } = {
      'wifi': 'assets/icons/wifi.svg',
      'pool': 'assets/icons/pool.svg',
      'gym': 'assets/icons/gym.svg',
      'restaurant': 'assets/icons/breakfast.svg', // Usar breakfast icon para restaurant
      'parking': 'assets/icons/parking.svg',
      'room-service': 'assets/icons/tea.svg', // Usar tea icon para room service
      'airport-shuttle': 'assets/icons/accessible.svg', // Placeholder
      'parking-free': 'assets/icons/parking.svg',
      'car-rental': 'assets/icons/storage.svg', // Placeholder
      'golf': 'assets/icons/events.svg', // Placeholder
      'spa': 'assets/icons/spa.svg',
      'event-space': 'assets/icons/events.svg',
      'meeting-organizer': 'assets/icons/events.svg',
      'resort': 'assets/icons/pool.svg' // Placeholder
    };
    return iconMap[amenityId] || 'assets/icons/check.svg';
  }

  // Formatea la distancia al aeropuerto con el código
  getFormattedAirportDistance(): string {
    if (!this.hotel?.distanceToAirport) return '';
    if (this.hotel.airportCode) {
      return `${this.hotel.distanceToAirport} al aeropuerto ${this.hotel.airportCode}`;
    }
    return this.hotel.distanceToAirport;
  }

  // Actions
  onRequestReservation(): void {
    if (this.hotel && this.hotel.id) {
      // Guardar parámetros de búsqueda en sessionStorage
      if (this.searchParams) {
        const params = {
          checkIn: this.searchParams.checkIn ? this.searchParams.checkIn.toISOString() : null,
          checkOut: this.searchParams.checkOut ? this.searchParams.checkOut.toISOString() : null,
          rooms: this.searchParams.rooms,
          attendees: this.searchParams.attendees
        };
        console.log('group-hotel-card: Guardando parámetros:', params);
        sessionStorage.setItem('groupSearchParams', JSON.stringify(params));
      }
      this.router.navigate(['/client/groups/request', this.hotel.id]);
    }
  }
}
