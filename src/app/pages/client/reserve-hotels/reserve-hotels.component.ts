import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Room, RoomFilterOptions, RoomType, BedType, RoomView, RoomRate } from '../../../core/models/room.model';
import { HotelSearchResult } from '../../../core/models/hotel-search.model';
import { BookingService } from '../../../core/services/booking.service';
import { SearchHotelService } from '../../../core/services/search-hotel.service';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Componente para selección de habitaciones de un hotel
 * Muestra las habitaciones disponibles con filtros y tarifas
 */
@Component({
  selector: 'app-reserve-hotels',
  templateUrl: './reserve-hotels.component.html',
  styleUrls: ['./reserve-hotels.component.scss']
})
export class ReserveHotelsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos del hotel
  hotel: HotelSearchResult | null = null;
  hotelId: number | string = 0;

  // Habitaciones
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  isLoading = true;

  // Parámetros de búsqueda
  checkIn: string = '';
  checkOut: string = '';
  numberOfRooms: number = 1;
  adults: number = 1;
  children: number = 0;
  numberOfNights: number = 2;

  // Filtros
  filterOptions: RoomFilterOptions;
  showFiltersModal = false;
  activeFilters: { type: string; value: string; label: string }[] = [];

  // Modal de detalles de habitación
  selectedRoom: Room | null = null;
  showRoomDetailsModal = false;


  // Estado del carrusel para cada habitación (por room.id)
  roomImageIndices: { [key: string]: number } = {};

  // Estado de autenticación
  isLoggedIn = false;

  // Modal de tarifa para socios
  showMemberRateModal = false;
  pendingRoom: Room | null = null;
  pendingRateId: string = '';

  /**
   * Obtiene el logo de la marca según el hotel
   */
  get brandLogo(): { type: 'text' | 'image', value: string, class?: string } {
    if (!this.hotel) return { type: 'text', value: '' };

    const name = this.hotel.name.toLowerCase();

    if (name.includes('le royal méridien') || name.includes('le meridien')) {
      return {
        type: 'image',
        value: 'assets/brand/hotels/Le-Royal-Meridien/le-meridien-logo.png',
        class: 'brand-logo-img'
      };
    } else if (name.includes('jw marriott')) {
      return {
        type: 'image',
        value: 'assets/brand/hotels/JW-Venice/jw-marriott-logo.svg',
        class: 'brand-logo-img'
      };
    } else {
      return { type: 'text', value: 'W HOTELS' };
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private searchHotelService: SearchHotelService,
    private authService: AuthService
  ) {
    this.filterOptions = this.bookingService.getRoomFilterOptions();
  }

  ngOnInit(): void {
    this.loadRouteParams();
    this.loadSearchParams();
    this.checkAuthStatus();
  }

  /**
   * Verifica el estado de autenticación
   */
  private checkAuthStatus(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los parámetros de la ruta
   */
  private loadRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        // No forzar a número con '+' pq los IDs pueden ser strings alfanuméricos
        this.hotelId = params['id'];
        this.loadHotelData();
        this.loadRooms();
      });
  }

  /**
   * Carga los parámetros de búsqueda guardados
   */
  private loadSearchParams(): void {
    const params = this.bookingService.getSearchParams();
    if (params) {
      this.checkIn = params.checkIn;
      this.checkOut = params.checkOut;
      this.numberOfRooms = params.rooms;
      this.adults = params.adults;
      this.children = params.children;
      this.numberOfNights = this.bookingService.calculateNights(this.checkIn, this.checkOut);
    } else {
      // Valores por defecto si no hay parámetros
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(today);
      dayAfter.setDate(dayAfter.getDate() + 3);

      // Formatear fechas manualmente para evitar problemas de zona horaria
      const formatDateLocal = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      this.checkIn = formatDateLocal(tomorrow);
      this.checkOut = formatDateLocal(dayAfter);
      this.numberOfNights = 2;
    }
  }

  /**
   * Carga los datos del hotel
   */
  private loadHotelData(): void {
    this.searchHotelService.getHotelById(this.hotelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(hotel => {
        this.hotel = hotel ?? null;
      });
  }

  /**
   * Carga las habitaciones del hotel
   */
  private loadRooms(): void {
    this.isLoading = true;
    this.bookingService.getRoomsByHotelId(this.hotelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rooms) => {
          this.rooms = rooms;
          this.filteredRooms = [...rooms];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar habitaciones:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * Formatea la fecha para mostrar
   */
  formatDate(dateString: string): string {
    return this.bookingService.formatDisplayDate(dateString);
  }

  /**
   * Obtiene el texto de habitaciones y huéspedes
   */
  get guestsText(): string {
    const guestText = this.adults === 1 ? '1 huésped' : `${this.adults} huéspedes`;
    const roomText = this.numberOfRooms === 1 ? '1 habitación' : `${this.numberOfRooms} habitaciones`;
    return `${roomText}, ${guestText}`;
  }

  /**
   * Obtiene el conteo de tipos de habitación
   */
  get roomTypesCount(): number {
    return this.filteredRooms.length;
  }

  // ========== FILTROS ==========

  /**
   * Abre el modal de filtros
   */
  openFiltersModal(): void {
    this.showFiltersModal = true;
  }

  /**
   * Cierra el modal de filtros
   */
  closeFiltersModal(): void {
    this.showFiltersModal = false;
  }

  /**
   * Toggle de un filtro de tipo de habitación
   */
  toggleRoomTypeFilter(roomType: { id: RoomType; name: string; selected: boolean }): void {
    roomType.selected = !roomType.selected;
    this.applyFilters();
  }

  /**
   * Toggle de un filtro de tipo de cama
   */
  toggleBedTypeFilter(bedType: { id: BedType; name: string; selected: boolean }): void {
    bedType.selected = !bedType.selected;
    this.applyFilters();
  }

  /**
   * Toggle de un filtro de vista
   */
  toggleViewFilter(view: { id: RoomView; name: string; selected: boolean }): void {
    view.selected = !view.selected;
    this.applyFilters();
  }

  /**
   * Aplica los filtros seleccionados
   */
  applyFilters(): void {
    this.filteredRooms = this.rooms.filter(room => {
      const selectedRoomTypes = this.filterOptions.roomTypes.filter(t => t.selected).map(t => t.id);
      const selectedBedTypes = this.filterOptions.bedTypes.filter(t => t.selected).map(t => t.id);
      const selectedViews = this.filterOptions.views.filter(t => t.selected).map(t => t.id);

      const matchesRoomType = selectedRoomTypes.length === 0 || selectedRoomTypes.includes(room.type);
      const matchesBedType = selectedBedTypes.length === 0 || selectedBedTypes.includes(room.bedType);
      const matchesView = selectedViews.length === 0 || selectedViews.includes(room.view);

      return matchesRoomType && matchesBedType && matchesView;
    });

    this.updateActiveFilters();
  }

  /**
   * Actualiza la lista de filtros activos
   */
  private updateActiveFilters(): void {
    this.activeFilters = [];

    this.filterOptions.roomTypes.filter(t => t.selected).forEach(t => {
      this.activeFilters.push({ type: 'roomType', value: t.id, label: t.name });
    });

    this.filterOptions.bedTypes.filter(t => t.selected).forEach(t => {
      this.activeFilters.push({ type: 'bedType', value: t.id, label: t.name });
    });

    this.filterOptions.views.filter(t => t.selected).forEach(t => {
      this.activeFilters.push({ type: 'view', value: t.id, label: t.name });
    });
  }

  /**
   * Elimina un filtro activo
   */
  removeFilter(filter: { type: string; value: string; label: string }): void {
    switch (filter.type) {
      case 'roomType':
        const roomType = this.filterOptions.roomTypes.find(t => t.id === filter.value);
        if (roomType) roomType.selected = false;
        break;
      case 'bedType':
        const bedType = this.filterOptions.bedTypes.find(t => t.id === filter.value);
        if (bedType) bedType.selected = false;
        break;
      case 'view':
        const view = this.filterOptions.views.find(t => t.id === filter.value);
        if (view) view.selected = false;
        break;
    }
    this.applyFilters();
  }

  /**
   * Limpia todos los filtros
   */
  clearAllFilters(): void {
    this.filterOptions.roomTypes.forEach(t => t.selected = false);
    this.filterOptions.bedTypes.forEach(t => t.selected = false);
    this.filterOptions.views.forEach(t => t.selected = false);
    this.applyFilters();
  }

  // ========== CARRUSEL DE ROOM CARDS ==========

  /**
   * Obtiene el índice de imagen actual para una habitación
   */
  getRoomImageIndex(room: Room): number {
    return this.roomImageIndices[room.id] || 0;
  }

  /**
   * Obtiene la imagen actual del carrusel para una habitación
   */
  getCurrentRoomImage(room: Room): string {
    const index = this.getRoomImageIndex(room);
    return room.images[index] || room.images[0];
  }

  /**
   * Navega a la imagen anterior en el carrusel de una habitación
   */
  prevRoomCardImage(room: Room): void {
    const currentIndex = this.getRoomImageIndex(room);
    if (currentIndex > 0) {
      this.roomImageIndices[room.id] = currentIndex - 1;
    } else {
      this.roomImageIndices[room.id] = room.images.length - 1;
    }
  }

  /**
   * Navega a la siguiente imagen en el carrusel de una habitación
   */
  nextRoomCardImage(room: Room): void {
    const currentIndex = this.getRoomImageIndex(room);
    if (currentIndex < room.images.length - 1) {
      this.roomImageIndices[room.id] = currentIndex + 1;
    } else {
      this.roomImageIndices[room.id] = 0;
    }
  }

  /**
   * Selecciona una imagen específica del carrusel de una habitación
   */
  goToRoomCardImage(room: Room, index: number): void {
    this.roomImageIndices[room.id] = index;
  }

  // ========== MODAL DE DETALLES ==========

  /**
   * Abre el modal de detalles de habitación
   */
  openRoomDetails(room: Room): void {
    this.selectedRoom = room;


    this.showRoomDetailsModal = true;
  }

  /**
   * Cierra el modal de detalles de habitación
   */
  closeRoomDetails(): void {
    this.showRoomDetailsModal = false;
    this.selectedRoom = null;
  }



  // ========== SELECCIÓN DE TARIFA ==========

  /**
   * Selecciona una tarifa y navega al formulario de reserva
   */
  selectRate(room: Room, rateId: string): void {
    const rate = room.rates.find(r => r.id === rateId);
    if (!rate || !this.hotel) return;

    // Verificar si es tarifa de socios y no está logueado
    if (rate.isMemberRate && !this.isLoggedIn) {
      this.pendingRoom = room;
      this.pendingRateId = rateId;
      this.showMemberRateModal = true;
      return;
    }

    this.proceedWithRate(room, rate);
  }

  /**
   * Procede con la selección de tarifa
   */
  private proceedWithRate(room: Room, rate: RoomRate): void {
    if (!this.hotel) return;

    // Verificar disponibilidad REAL por fechas
    this.bookingService.checkAvailability(this.hotelId, room.id, this.checkIn, this.checkOut, this.numberOfRooms)
      .subscribe(isAvailable => {
        if (!isAvailable) {
          // Si no hay disponibilidad para estas fechas, redirigir al calendario de esta habitación
          this.router.navigate(['/client/hotel', this.hotelId, 'availability'], {
            queryParams: {
              roomId: room.id,
              checkIn: this.checkIn,
              checkOut: this.checkOut,
              rooms: this.numberOfRooms,
              adults: this.adults,
              children: this.children,
              nights: this.numberOfNights
            }
          });
        } else {
          // Si hay disponibilidad, proceder a la reserva
          this.performBookingNavigation(room, rate);
        }
      });
  }

  private performBookingNavigation(room: Room, rate: RoomRate): void {

    // Guardar el resumen de la reserva
    this.bookingService.setBookingSummary({
      hotelName: this.hotel!.name,
      hotelBrand: this.hotel!.brand,
      roomName: room.name,
      roomImage: room.images[0],
      rateName: rate.name,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      nights: this.numberOfNights,
      rooms: this.numberOfRooms,
      adults: this.adults,
      pricePerNight: rate.pricePerNight,
      totalPrice: this.bookingService.calculateTotalPrice(rate.pricePerNight, this.numberOfNights, this.numberOfRooms),
      currency: rate.currency
    });

    // Navegar al formulario de reserva
    this.router.navigate(['/client/hotel', this.hotelId, 'booking'], {
      queryParams: {
        roomId: room.id,
        rateId: rate.id
      }
    });
  }

  /**
   * Calcula el precio total para una tarifa
   */
  calculateTotalForRate(pricePerNight: number): number {
    return this.bookingService.calculateTotalPrice(pricePerNight, this.numberOfNights, this.numberOfRooms);
  }

  /**
   * Vuelve a la página de búsqueda
   */
  goBack(): void {
    this.router.navigate(['/client/search-hotels']);
  }

  // ========== MODAL DE TARIFA PARA SOCIOS ==========

  /**
   * Cierra el modal de tarifa para socios
   */
  closeMemberRateModal(): void {
    this.showMemberRateModal = false;
    this.pendingRoom = null;
    this.pendingRateId = '';
  }

  /**
   * Navega a la página de login
   */
  goToLogin(): void {
    this.closeMemberRateModal();
    this.router.navigate(['/client/login']);
  }

  /**
   * Navega a la página de registro
   */
  goToRegister(): void {
    this.closeMemberRateModal();
    this.router.navigate(['/client/register']);
  }
}
