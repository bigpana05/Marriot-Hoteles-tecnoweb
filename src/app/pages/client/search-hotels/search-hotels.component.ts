import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchHotelService } from '../../../core/services/search-hotel.service';
import {
  HotelSearchResult,
  HotelSearchParams,
  SearchFilter,
  SortOption
} from '../../../core/models/hotel-search.model';
import { DateRange } from '../../../models/date-range.model';
import { RoomsData } from '../../../models/rooms-data.model';

/**
 * Componente principal de la página de búsqueda de hoteles
 * Muestra resultados de búsqueda con filtros y ordenamiento
 */
@Component({
  selector: 'app-search-hotels',
  templateUrl: './search-hotels.component.html',
  styleUrls: ['./search-hotels.component.scss']
})
export class SearchHotelsComponent implements OnInit, OnDestroy {
  // Estado de la búsqueda
  hotels: HotelSearchResult[] = [];
  filteredHotels: HotelSearchResult[] = [];
  isLoading = false;
  totalResults = 0;

  // Parámetros de búsqueda
  searchDestination = '';
  searchDates: DateRange = { checkIn: null, checkOut: null };
  roomsData: RoomsData = { rooms: 1, adults: 1, children: 0 };

  // Filtros y ordenamiento
  filters: SearchFilter[] = [];
  currentSort: SortOption = 'distance';
  showSortDropdown = false;

  // Subject para manejo de suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private searchHotelService: SearchHotelService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadFilters();
    this.parseQueryParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Parsea los parámetros de la URL para obtener los datos de búsqueda
   */
  private parseQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['destination']) {
          this.searchDestination = params['destination'];
        }
        if (params['checkIn'] && params['checkOut']) {
          this.searchDates = {
            checkIn: new Date(params['checkIn']),
            checkOut: new Date(params['checkOut'])
          };
        }
        if (params['rooms']) {
          this.roomsData.rooms = parseInt(params['rooms'], 10) || 1;
        }
        if (params['adults']) {
          this.roomsData.adults = parseInt(params['adults'], 10) || 1;
        }
        if (params['children']) {
          this.roomsData.children = parseInt(params['children'], 10) || 0;
        }

        // Ejecutar búsqueda si hay destino
        if (this.searchDestination) {
          this.performSearch();
        }
      });
  }

  /**
   * Carga los filtros disponibles
   */
  private loadFilters(): void {
    this.searchHotelService.getFilters()
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.filters = filters;
      });
  }

  /**
   * Ejecuta la búsqueda de hoteles
   */
  performSearch(): void {
    if (!this.searchDestination || !this.searchDates.checkIn || !this.searchDates.checkOut) {
      return;
    }

    this.isLoading = true;

    const params: HotelSearchParams = {
      destination: this.searchDestination,
      checkIn: this.searchDates.checkIn,
      checkOut: this.searchDates.checkOut,
      rooms: this.roomsData.rooms,
      adults: this.roomsData.adults,
      children: this.roomsData.children
    };

    this.searchHotelService.searchHotels(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hotels) => {
          this.hotels = hotels;
          this.applyFiltersAndSort();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al buscar hoteles:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * Aplica filtros y ordenamiento a los resultados
   */
  private applyFiltersAndSort(): void {
    let results = [...this.hotels];

    // Aplicar filtros
    const selectedFilters = this.filters.filter(f => f.selected);
    if (selectedFilters.length > 0) {
      results = results.filter(hotel => {
        return selectedFilters.every(filter => {
          const amenity = hotel.amenities.find(a => a.id === filter.id);
          return amenity?.available;
        });
      });
    }

    // Aplicar ordenamiento
    results = this.searchHotelService.sortHotels(results, this.currentSort);

    this.filteredHotels = results;
    this.totalResults = results.length;
  }

  /**
   * Maneja el cambio de un filtro
   * @param filterId - ID del filtro
   * @param event - Evento del checkbox
   */
  onFilterChange(filterId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.searchHotelService.updateFilter(filterId, checkbox.checked);

    // Actualizar lista local de filtros
    this.filters = this.filters.map(filter =>
      filter.id === filterId ? { ...filter, selected: checkbox.checked } : filter
    );

    this.applyFiltersAndSort();
  }

  /**
   * Maneja el cambio de ordenamiento
   * @param option - Nueva opción de ordenamiento
   */
  onSortChange(option: SortOption): void {
    this.currentSort = option;
    this.showSortDropdown = false;
    this.applyFiltersAndSort();
  }

  /**
   * Toggle del dropdown de ordenamiento
   */
  toggleSortDropdown(): void {
    this.showSortDropdown = !this.showSortDropdown;
  }

  /**
   * Obtiene el texto de la opción de ordenamiento actual
   */
  get sortOptionText(): string {
    switch (this.currentSort) {
      case 'distance':
        return 'Distancia';
      case 'price-low':
        return 'Precio: menor a mayor';
      case 'price-high':
        return 'Precio: mayor a menor';
      case 'rating':
        return 'Calificación';
      default:
        return 'Distancia';
    }
  }

  /**
   * Obtiene el número de noches de la estadía
   */
  get numberOfNights(): number {
    if (this.searchDates.checkIn && this.searchDates.checkOut) {
      const diffTime = Math.abs(
        this.searchDates.checkOut.getTime() - this.searchDates.checkIn.getTime()
      );
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 1;
  }

  /**
   * Obtiene el texto de habitaciones y huéspedes
   */
  get roomsText(): string {
    const totalGuests = this.roomsData.adults + this.roomsData.children;
    return `${this.roomsData.rooms} habit., ${totalGuests} huésp.`;
  }

  /**
   * Formatea el mes para mostrar en la barra de búsqueda
   */
  get datesDisplayText(): string {
    if (this.searchDates.checkIn) {
      const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
      return this.searchDates.checkIn.toLocaleDateString('es-ES', options);
    }
    return '';
  }

  /**
   * Maneja la actualización de búsqueda desde la barra superior
   */
  onSearchUpdate(params: { destination: string; dates: DateRange; rooms: RoomsData }): void {
    this.searchDestination = params.destination;
    this.searchDates = params.dates;
    this.roomsData = params.rooms;
    this.performSearch();
  }

  /**
   * Cierra el dropdown de ordenamiento al hacer click fuera
   */
  closeSortDropdown(): void {
    this.showSortDropdown = false;
  }
}
