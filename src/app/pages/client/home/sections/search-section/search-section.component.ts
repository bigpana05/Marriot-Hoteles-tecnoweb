import { Component, HostListener } from '@angular/core';
import { DateRange } from '../../../../../models/date-range.model';
import { RoomsData } from '../../../../../models/rooms-data.model';

@Component({
  selector: 'app-search-section',
  templateUrl: './search-section.component.html',
  styleUrls: ['./search-section.component.scss'],
})
export class SearchSectionComponent {
  showDestinationDropdown: boolean = false;
  showDatePicker: boolean = false;
  showRoomsSelector: boolean = false;

  selectedDestination: string = '';
  selectedDates: DateRange = { checkIn: null, checkOut: null };
  roomsData: RoomsData = { rooms: 1, adults: 1, children: 0 };

  isMobile: boolean = false;

  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  /**
   * Detecta si la pantalla es móvil (≤640px) para ajustar la UI
   */
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 640;
  }

  // Obtiene el texto a mostrar en el campo de destino
  get destinationText(): string {
    return this.selectedDestination || '¿A dónde quieres ir?';
  }

  // Obtiene el texto a mostrar en el campo de fechas
  get datesText(): string {
    if (this.selectedDates.checkIn && this.selectedDates.checkOut) {
      const checkIn = this.selectedDates.checkIn;
      const checkOut = this.selectedDates.checkOut;
      return `${this.formatDate(checkIn)} - ${this.formatDate(checkOut)}`;
    }
    return 'Agregar fechas';
  }

  // Obtiene el número de noches
  get numberOfNights(): number {
    if (this.selectedDates.checkIn && this.selectedDates.checkOut) {
      const diffTime = Math.abs(
        this.selectedDates.checkOut.getTime() -
          this.selectedDates.checkIn.getTime()
      );
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  // Verifica si debe mostrar el selector de habitaciones
  get shouldShowRoomsField(): boolean {
    return (
      !!this.selectedDestination &&
      this.selectedDates.checkIn !== null &&
      this.selectedDates.checkOut !== null
    );
  }

  // Obtiene el texto del selector de habitaciones
  get roomsText(): string {
    return `${this.roomsData.rooms} Habitación, ${
      this.roomsData.adults + this.roomsData.children
    } Huésped${
      this.roomsData.adults + this.roomsData.children > 1 ? 'es' : ''
    }`;
  }

  // Formatea una fecha
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('es-ES', options);
  }

  // Toggle destination dropdown
  toggleDestinationDropdown(): void {
    this.showDestinationDropdown = !this.showDestinationDropdown;
    this.showDatePicker = false;
    this.showRoomsSelector = false;
  }

  // Abre el date picker
  openDatePicker(): void {
    if (!this.showDatePicker) {
      this.showDatePicker = true;
      this.showDestinationDropdown = false;
      this.showRoomsSelector = false;
    }
  }

  // Abre el selector de habitaciones
  openRoomsSelector(): void {
    if (this.shouldShowRoomsField && !this.showRoomsSelector) {
      this.showRoomsSelector = true;
      this.showDestinationDropdown = false;
      this.showDatePicker = false;
    }
  }

  // Maneja selección de destino
  onDestinationSelected(destination: string): void {
    this.selectedDestination = destination;
    this.showDestinationDropdown = false;
  }

  // Abre el dropdown de destino cuando hace click
  openDestinationDropdown(): void {
    // Solo abrir si está cerrado
    if (!this.showDestinationDropdown) {
      this.showDestinationDropdown = true;
      this.showDatePicker = false;
      this.showRoomsSelector = false;
    }
  }

  // Maneja el input del usuario en el campo de destino
  onDestinationInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.selectedDestination = input;
    // Abrir dropdown cuando el usuario escribe para mostrar sugerencias filtradas
    if (!this.showDestinationDropdown) {
      this.showDestinationDropdown = true;
      this.showDatePicker = false;
      this.showRoomsSelector = false;
    }
  }

  // Maneja selección de fechas
  onDatesSelected(dates: DateRange): void {
    this.selectedDates = dates;
    this.showDatePicker = false;
  }

  // Maneja selección de habitaciones
  onRoomsSelected(rooms: RoomsData): void {
    this.roomsData = rooms;
    // No cerrar aquí para permitir múltiples cambios. Se cierra con el botón Done o click fuera.
  }

  // Cierra todos los dropdowns
  closeAllDropdowns(): void {
    this.showDestinationDropdown = false;
    this.showDatePicker = false;
    this.showRoomsSelector = false;
  }

  // Limpia el destino seleccionado
  clearDestination(event: Event): void {
    event.stopPropagation();
    this.selectedDestination = '';
  }

  // Limpia las fechas seleccionadas
  clearDates(event: Event): void {
    event.stopPropagation();
    this.selectedDates = { checkIn: null, checkOut: null };
  }

  // Carousel Logic
  hotelImages: string[] = [
    '/assets/brand/hotels/Marriott_International-Castillo_Hotel_Son_Vida-a_Luxury_Collection_Hotel-Mallorca-ref185756.jpg',
    '/assets/brand/hotels/Marriott_International-Marriott_Resort_Palm_Jumeirah-Dubai-ref163347.jpg',
    '/assets/brand/hotels/Marriott_International-Mount_Juliet_Estate-Autograph_Collection-ref187730.jpeg',
    '/assets/brand/hotels/Marriott_International-W-Algarve-Exterior-ref163410.jpg',
  ];

  currentIndex: number = 0;
  private intervalId: any;

  /**
   * Obtiene las imágenes visibles del carrusel según el tamaño de pantalla
   * @returns Array con 1 imagen en móvil (≤640px) o 2 imágenes en desktop/tablet
   */
  get visibleImages(): string[] {
    if (this.isMobile) {
      // En móvil, mostrar solo 1 imagen
      return [this.hotelImages[this.currentIndex]];
    } else {
      // En desktop/tablet, mostrar 2 imágenes
      return [
        this.hotelImages[this.currentIndex],
        this.hotelImages[(this.currentIndex + 1) % this.hotelImages.length],
      ];
    }
  }

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000); // Cambia cada 5 segundos
  }

  stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide(): void {
    // Avanzar de 1 en 1, circular
    this.currentIndex = (this.currentIndex + 1) % this.hotelImages.length;
  }

  // Helper para obtener las imágenes visibles basado en el índice actual
  // Esto es útil si quisiéramos hacer un slice, pero para animación CSS usaremos transform

  /**
   * Busca hoteles según los criterios seleccionados
   * TODO: Implementar búsqueda real cuando el backend esté disponible
   */
  findHotels(): void {
    // Solo busca si se han seleccionado destino y fechas
    if (
      this.selectedDestination &&
      this.selectedDates.checkIn &&
      this.selectedDates.checkOut
    ) {
      // TODO: Implementar llamada al servicio de búsqueda
      // this.hotelService.searchHotels(this.selectedDestination, this.selectedDates, this.roomsData)
    }
  }
}
