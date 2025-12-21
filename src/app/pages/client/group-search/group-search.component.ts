import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupBookingService } from '../../../core/services/group-booking.service';
import { GroupHotel } from '../../../core/models/group-hotel.model';
import { DateRange } from '../../../models/date-range.model';

@Component({
  selector: 'app-group-search',
  templateUrl: './group-search.component.html',
  styleUrls: ['./group-search.component.scss']
})
export class GroupSearchComponent implements OnInit {
  hotels: GroupHotel[] = [];
  filteredHotels: GroupHotel[] = [];
  loading = false;
  error: string | null = null;

  // Filtros de búsqueda
  searchCity = '';
  minRooms: number | null = null;
  minAttendees: number | null = null;

  // Dropdown de destinos
  showDestinationsDropdown = false;

  // Date picker
  showDatePicker = false;
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  datesText = '';
  numberOfNights = 0;

  // Estado de búsqueda
  hasSearched = false;
  isSearching = false;

  constructor(
    private groupService: GroupBookingService,
    private router: Router
  ) { }

  // Getter para destinos de hoteles grupales
  get groupDestinations(): string[] {
    const destinations: string[] = [];
    const cities = new Set<string>();

    // Agregar ciudades únicas
    this.hotels.forEach(hotel => {
      if (hotel.city && hotel.country) {
        const cityDestination = `${hotel.city}, ${hotel.country}`;
        if (!cities.has(cityDestination)) {
          cities.add(cityDestination);
          destinations.push(cityDestination);
        }
      }
    });

    // Agregar hoteles completos
    this.hotels.forEach(hotel => {
      if (hotel.name && hotel.city && hotel.country) {
        destinations.push(`${hotel.name}, ${hotel.city}, ${hotel.country}`);
      }
    });

    return destinations;
  }

  // Getter para parámetros de búsqueda actuales
  get currentSearchParams() {
    return {
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
      rooms: this.minRooms,
      attendees: this.minAttendees
    };
  }


  ngOnInit(): void {
    this.loadHotels();

    // Inicializar fechas por defecto
    this.initializeDefaultDates();

    // Listener para cerrar dropdowns al hacer click fuera
    document.addEventListener('click', () => {
      this.closeAllDropdowns();
    });
  }

  initializeDefaultDates(): void {
    const today = new Date();
    // Fecha de mañana
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Pasado mañana
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    this.checkInDate = tomorrow;
    this.checkOutDate = dayAfter;

    // Calcular noches
    const diffTime = Math.abs(dayAfter.getTime() - tomorrow.getTime());
    this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Formatear texto
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    const checkInStr = tomorrow.toLocaleDateString('es-ES', options);
    const checkOutStr = dayAfter.toLocaleDateString('es-ES', options);
    this.datesText = `${checkInStr} - ${checkOutStr}`;
  }

  loadHotels(): void {
    this.loading = true;
    this.groupService.getGroupHotels().subscribe({
      next: hotels => {
        this.hotels = hotels;
        // No aplicar filtros hasta que se haga una búsqueda
        this.filteredHotels = [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar hoteles grupales';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    // Siempre mostrar todos si no hay filtros activos
    if (!this.searchCity && this.minRooms === null && this.minAttendees === null) {
      this.filteredHotels = [];
      return;
    }

    // Animación de búsqueda
    this.isSearching = true;

    let filtered = [...this.hotels];

    // Filtro por destino (búsqueda flexible por palabras)
    if (this.searchCity && this.searchCity.trim()) {
      const query = this.searchCity.toLowerCase();
      filtered = filtered.filter(h => {
        const cityMatch = h.city?.toLowerCase().includes(query);
        const countryMatch = h.country?.toLowerCase().includes(query);
        const nameMatch = h.name?.toLowerCase().includes(query);

        // También buscar por palabras individuales
        const searchWords = query.split(/[,\s]+/).filter(w => w.length > 2);
        const wordMatch = searchWords.some(word =>
          h.city?.toLowerCase().includes(word) ||
          h.country?.toLowerCase().includes(word) ||
          h.name?.toLowerCase().includes(word)
        );

        return cityMatch || countryMatch || nameMatch || wordMatch;
      });
    }

    // Filtro por habitaciones mínimas
    if (this.minRooms !== null && this.minRooms > 0) {
      filtered = filtered.filter(h => h.totalRooms >= this.minRooms!);
    }

    // Filtro por asistentes (estimación: 2 asistentes por habitación)
    if (this.minAttendees !== null && this.minAttendees > 0) {
      filtered = filtered.filter(h => h.totalRooms * 2 >= this.minAttendees!);
    }

    this.filteredHotels = filtered;
    this.hasSearched = true; // Marcar que se ha realizado una búsqueda

    // Terminar animación después de 500ms
    setTimeout(() => {
      this.isSearching = false;
    }, 500);
  }

  // Métodos para date picker
  openDatePicker(): void {
    this.closeAllDropdowns();
    this.showDatePicker = true;
  }

  onDatesSelected(dates: DateRange): void {
    if (!dates.checkIn || !dates.checkOut) return;

    this.checkInDate = dates.checkIn;
    this.checkOutDate = dates.checkOut;

    // Calcular noches
    const diffTime = Math.abs(dates.checkOut.getTime() - dates.checkIn.getTime());
    this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Formatear texto
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    const checkInStr = dates.checkIn.toLocaleDateString('es-ES', options);
    const checkOutStr = dates.checkOut.toLocaleDateString('es-ES', options);
    this.datesText = `${checkInStr} - ${checkOutStr}`;

    this.showDatePicker = false;
  }

  closeAllDropdowns(): void {
    this.showDatePicker = false;
    this.showDestinationsDropdown = false;
  }

  // Métodos para dropdown de destinos
  openDestinationDropdown(): void {
    this.closeAllDropdowns();
    this.showDestinationsDropdown = true;
  }

  onDestinationSelected(destination: string): void {
    this.searchCity = destination;
    this.showDestinationsDropdown = false;
  }

  selectHotel(hotel: GroupHotel): void {
    // Guardar todos los parámetros de búsqueda en sessionStorage
    const searchParams = {
      checkIn: this.checkInDate ? this.checkInDate.toISOString() : null,
      checkOut: this.checkOutDate ? this.checkOutDate.toISOString() : null,
      rooms: this.minRooms || null,
      attendees: this.minAttendees || null
    };

    console.log('Guardando parámetros de búsqueda:', searchParams); // Debug
    sessionStorage.setItem('groupSearchParams', JSON.stringify(searchParams));
    this.router.navigate(['/client/groups/request', hotel.id]);
  }

  formatPrice(price: number, currency: string): string {
    return `${price} ${currency}`;
  }
}
