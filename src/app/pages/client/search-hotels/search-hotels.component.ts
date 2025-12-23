import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchHotelService } from '../../../core/services/search-hotel.service';
import {
  HotelSearchResult,
  HotelSearchParams,
  SearchFilter,
  SortOption,
  HotelBrand,
  FilterAmenity
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

  // Estado de los dropdowns de búsqueda
  showDestinationDropdown = false;
  showDatePicker = false;
  showRoomsSelector = false;

  // Estado del scroll para animación de la barra
  isScrolled = false;

  // Estado del modal de filtros
  showFiltersModal = false;
  filtersModalView: 'all' | 'amenities' | 'brands' = 'all';
  brands: HotelBrand[] = [];
  amenities: FilterAmenity[] = [];

  // Subject para manejo de suscripciones
  private destroy$ = new Subject<void>();

  /**
   * Detecta el scroll para cambiar el estado de la barra de búsqueda
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // Activar el estado scrolled después de 50px de scroll
    this.isScrolled = window.scrollY > 50;
  }

  constructor(
    private searchHotelService: SearchHotelService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadFilters();
    this.loadBrands();
    this.loadAmenities();
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
          // Parsear fechas asumiendo hora local para evitar desfase de zona horaria
          const [inYear, inMonth, inDay] = params['checkIn'].split('-').map(Number);
          const [outYear, outMonth, outDay] = params['checkOut'].split('-').map(Number);

          this.searchDates = {
            checkIn: new Date(inYear, inMonth - 1, inDay),
            checkOut: new Date(outYear, outMonth - 1, outDay)
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
   * Carga las marcas disponibles
   */
  private loadBrands(): void {
    this.searchHotelService.getBrands()
      .pipe(takeUntil(this.destroy$))
      .subscribe(brands => {
        this.brands = brands;
      });
  }

  /**
   * Carga las comodidades disponibles para filtrar
   */
  private loadAmenities(): void {
    this.searchHotelService.getAmenities()
      .pipe(takeUntil(this.destroy$))
      .subscribe(amenities => {
        this.amenities = amenities;
      });
  }

  /**
   * Abre el modal de filtros
   * @param view - Vista a mostrar (all, amenities, brands)
   */
  openFiltersModal(view: 'all' | 'amenities' | 'brands' = 'all'): void {
    this.filtersModalView = view;
    this.showFiltersModal = true;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el modal de filtros
   */
  closeFiltersModal(): void {
    this.showFiltersModal = false;
    document.body.style.overflow = '';
  }

  /**
   * Maneja el cambio de una comodidad en el modal
   * @param amenityId - ID de la comodidad
   */
  onAmenityChange(amenityId: string): void {
    const index = this.amenities.findIndex(a => a.id === amenityId);
    if (index !== -1) {
      this.amenities[index].selected = !this.amenities[index].selected;
      this.searchHotelService.updateAmenity(amenityId, this.amenities[index].selected);
      this.amenities = [...this.amenities];
    }
  }

  /**
   * Maneja el cambio de una marca en el modal
   * @param brandId - ID de la marca
   */
  onBrandChange(brandId: string): void {
    const index = this.brands.findIndex(b => b.id === brandId);
    if (index !== -1) {
      this.brands[index].selected = !this.brands[index].selected;
      this.searchHotelService.updateBrand(brandId, this.brands[index].selected);
      this.brands = [...this.brands];
    }
  }

  /**
   * Selecciona todas las marcas de una categoría
   * @param category - Categoría de marcas
   */
  selectAllBrands(category: 'luxury' | 'premium'): void {
    this.searchHotelService.selectAllBrandsByCategory(category);
    this.brands = this.brands.map(b =>
      b.category === category ? { ...b, selected: true } : b
    );
  }

  /**
   * Aplica los filtros seleccionados y cierra el modal
   */
  applyFilters(): void {
    this.closeFiltersModal();
    this.applyFiltersAndSort();
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.searchHotelService.clearAllFilters();
    this.brands = this.brands.map(b => ({ ...b, selected: false }));
    this.amenities = this.amenities.map(a => ({ ...a, selected: false }));
    this.filters = this.filters.map(f => ({ ...f, selected: false }));
  }

  /**
   * Obtiene las marcas filtradas por categoría
   */
  getBrandsByCategory(category: 'luxury' | 'premium'): HotelBrand[] {
    return this.brands.filter(b => b.category === category);
  }

  /**
   * Obtiene las amenidades seleccionadas para mostrar en la barra
   */
  getSelectedAmenities(): FilterAmenity[] {
    return this.amenities.filter(a => a.selected);
  }

  /**
   * Obtiene las marcas seleccionadas para mostrar en la barra
   */
  getSelectedBrands(): HotelBrand[] {
    return this.brands.filter(b => b.selected);
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

    // Filtrar por amenidades seleccionadas (el hotel debe tener TODAS las amenidades seleccionadas)
    const selectedAmenities = this.amenities.filter(a => a.selected);
    if (selectedAmenities.length > 0) {
      results = results.filter(hotel => {
        return selectedAmenities.every(selectedAmenity => {
          const hotelAmenity = hotel.amenities.find(a => a.id === selectedAmenity.id);
          return hotelAmenity?.available === true;
        });
      });
    }

    // Filtrar por marcas seleccionadas (el hotel debe ser de UNA de las marcas seleccionadas)
    const selectedBrands = this.brands.filter(b => b.selected);
    if (selectedBrands.length > 0) {
      results = results.filter(hotel => {
        return selectedBrands.some(selectedBrand => {
          const brandNameMap: { [key: string]: string } = {
            'jw-marriott': 'JW Marriott',
            'w-hotels': 'W Hotels',
            'le-meridien': 'Le Méridien'
          };
          return hotel.brand === brandNameMap[selectedBrand.id];
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

  /**
   * Cierra todos los dropdowns al hacer clic fuera
   */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAllDropdowns();
  }

  /**
   * Cierra todos los dropdowns
   */
  closeAllDropdowns(): void {
    this.showDestinationDropdown = false;
    this.showDatePicker = false;
    this.showRoomsSelector = false;
    this.showSortDropdown = false;
  }

  /**
   * Abre el dropdown de destino
   */
  openDestinationDropdown(): void {
    this.showDestinationDropdown = true;
    this.showDatePicker = false;
    this.showRoomsSelector = false;
  }

  /**
   * Abre el date picker
   */
  openDatePicker(): void {
    this.showDestinationDropdown = false;
    this.showDatePicker = true;
    this.showRoomsSelector = false;
  }

  /**
   * Abre el selector de habitaciones
   */
  openRoomsSelector(): void {
    this.showDestinationDropdown = false;
    this.showDatePicker = false;
    this.showRoomsSelector = true;
  }

  /**
   * Maneja la selección de destino
   */
  onDestinationSelected(destination: string): void {
    this.searchDestination = destination;
    this.showDestinationDropdown = false;
  }

  /**
   * Maneja input en campo destino
   */
  onDestinationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchDestination = input.value;
  }

  /**
   * Maneja la selección de fechas
   */
  onDatesSelected(dates: DateRange): void {
    this.searchDates = dates;
    this.showDatePicker = false;
  }

  /**
   * Maneja la selección de habitaciones
   */
  onRoomsSelected(roomsData: RoomsData): void {
    this.roomsData = roomsData;
    this.showRoomsSelector = false;
  }

  /**
   * Obtiene el texto de fechas para mostrar
   */
  get datesText(): string {
    if (this.searchDates.checkIn && this.searchDates.checkOut) {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      };
      const checkIn = this.searchDates.checkIn.toLocaleDateString('es-ES', options);
      const checkOut = this.searchDates.checkOut.toLocaleDateString('es-ES', options);
      return `${checkIn} - ${checkOut}`;
    }
    return 'Agregar fechas';
  }

  /**
   * Obtiene la fecha de check-in formateada para pasar a la reserva
   */
  get formattedCheckIn(): string {
    if (this.searchDates.checkIn) {
      return this.searchDates.checkIn.toISOString().split('T')[0];
    }
    return '';
  }

  /**
   * Obtiene la fecha de check-out formateada para pasar a la reserva
   */
  get formattedCheckOut(): string {
    if (this.searchDates.checkOut) {
      return this.searchDates.checkOut.toISOString().split('T')[0];
    }
    return '';
  }
}
