import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HotelSearchResult } from '../../../core/models/hotel-search.model';
import { Room } from '../../../core/models/room.model';
import { SearchHotelService } from '../../../core/services/search-hotel.service';
import { BookingService } from '../../../core/services/booking.service';
import { CalendarDay, CalendarWeek } from '../../../core/models/calendar.model';
import { Booking } from '../../../core/models/booking.model';

/**
 * Componente de calendario de disponibilidad
 * Muestra las fechas disponibles con precios para un hotel
 */
@Component({
  selector: 'app-availability-calendar',
  templateUrl: './availability-calendar.component.html',
  styleUrls: ['./availability-calendar.component.scss']
})
export class AvailabilityCalendarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos del hotel
  hotelId: number = 0;
  hotel: HotelSearchResult | null = null;

  // Habitación específica (si se proporciona roomId)
  roomId: number | string | null = null;
  selectedRoom: Room | null = null;

  // Reservas activas
  activeBookings: Booking[] = [];

  // Parámetros de búsqueda
  numberOfRooms: number = 1;
  adults: number = 1;
  children: number = 0;
  numberOfNights: number = 1;

  // Calendario
  currentMonth: Date = new Date();
  calendarWeeks: CalendarWeek[] = [];
  weekDays: string[] = ['l', 'm', 'm', 'j', 'v', 's', 'd'];

  // Selección
  selectedDate: Date | null = null;
  basePrice: number = 304; // Precio base de ejemplo

  // Estado
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchHotelService: SearchHotelService,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.loadRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los parámetros de la ruta
   */
  private loadRouteParams(): void {
    combineLatest([
      this.route.paramMap,
      this.route.queryParams
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, queryParams]) => {
        // 1. Params de ruta (ID Hotel) - usar paramMap para más seguridad
        const id = params.get('id');
        if (id) {
          this.hotelId = +id;
        }

        // 2. Query Params
        this.numberOfRooms = +queryParams['rooms'] || 1;
        this.adults = +queryParams['adults'] || 1;
        this.children = +queryParams['children'] || 0;
        this.numberOfNights = +queryParams['nights'] || 1;

        // Capturar roomId
        if (queryParams['roomId']) {
          this.roomId = queryParams['roomId'];
        } else {
          this.roomId = null;
        }

        // Capturar fechas
        if (queryParams['checkIn']) {
          const checkInDate = new Date(queryParams['checkIn']);
          this.selectedDate = checkInDate;
          this.currentMonth = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), 1);
        } else if (queryParams['month'] && queryParams['year']) {
          this.currentMonth = new Date(+queryParams['year'], +queryParams['month'] - 1, 1);
        } else {
          this.currentMonth = new Date();
        }

        // Cargar datos SOLO cuando tengamos el ID del hotel listo
        if (this.hotelId) {
          this.loadHotelData();
        }
      });
  }

  /**
   * Carga los datos del hotel y las reservas
   * Si hay roomId, carga específicamente esa habitación y sus reservas
   */
  private loadHotelData(): void {
    this.isLoading = true;

    // Si hay roomId, cargar bookings del hotel y filtrar localmente para asegurar consistencia de tipos
    if (this.roomId) {
      forkJoin({
        hotel: this.searchHotelService.getHotelById(this.hotelId),
        room: this.bookingService.getRoomById(this.roomId), // ID como string o number, el servicio soporta ambos
        bookings: this.bookingService.getActiveBookings(this.hotelId) // Cargar todas las reservas (para filtrar localmente)
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe(({ hotel, room, bookings }) => {
          this.hotel = hotel ?? null;
          this.selectedRoom = room;

          // Filtrar reservas localmente permitiendo comparacion flexible (==) entre string y number
          // Esto soluciona que activeBookings esté vacío si roomId es string "3" y en DB es number 3
          this.activeBookings = (bookings || []).filter(b => b.roomId == this.roomId);

          this.isLoading = false;
          this.generateCalendar();
        });
    } else {
      // Cargar todas las reservas del hotel (modo general)
      forkJoin({
        hotel: this.searchHotelService.getHotelById(this.hotelId),
        bookings: this.bookingService.getActiveBookings(this.hotelId)
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe(({ hotel, bookings }) => {
          this.hotel = hotel ?? null;
          this.activeBookings = bookings || [];
          this.isLoading = false;
          this.generateCalendar();
        });
    }
  }

  /**
   * Genera el calendario del mes actual
   */
  private generateCalendar(): void {
    if (!this.hotel) return;

    this.calendarWeeks = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);

    // Día de la semana del primer día (Lunes = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentWeek: CalendarDay[] = [];

    // Días del mes anterior
    const prevMonth = new Date(year, month, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const dayNum = prevMonth.getDate() - i;
      currentWeek.push({
        date: new Date(year, month - 1, dayNum),
        dayNumber: dayNum,
        isCurrentMonth: false,
        isAvailable: false,
        price: null,
        isSelected: false,
        isPast: true
      });
    }

    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      const isPast = date < today;

      // Calcular disponibilidad REAL
      const availability = this.calculateAvailability(date, isPast);

      currentWeek.push({
        date: date,
        dayNumber: day,
        isCurrentMonth: true,
        isAvailable: availability.isAvailable,
        price: availability.price,
        isSelected: this.selectedDate?.getTime() === date.getTime(),
        isPast: isPast
      });

      if (currentWeek.length === 7) {
        this.calendarWeeks.push({ days: currentWeek });
        currentWeek = [];
      }
    }

    // Completar última semana
    if (currentWeek.length > 0) {
      let nextDay = 1;
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: new Date(year, month + 1, nextDay),
          dayNumber: nextDay,
          isCurrentMonth: false,
          isAvailable: false,
          price: null,
          isSelected: false,
          isPast: false
        });
        nextDay++;
      }
      this.calendarWeeks.push({ days: currentWeek });
    }
  }

  /**
   * Calcula la disponibilidad real basada en reservas y capacidad
   * Si hay habitación específica, usa room.available como capacidad
   * Si no, usa hotel.availableRooms (modo general)
   */
  private calculateAvailability(date: Date, isPast: boolean): { isAvailable: boolean; price: number | null } {
    if (isPast) {
      return { isAvailable: false, price: null };
    }

    if (!this.hotel) return { isAvailable: false, price: null };

    // Capacidad según el modo (habitación específica o hotel general)
    let totalCapacity: number;
    if (this.selectedRoom) {
      // Modo habitación específica: usar inventario de la habitación
      totalCapacity = this.selectedRoom.available || 0;
    } else {
      // Modo general: usar capacidad del hotel
      totalCapacity = this.hotel.availableRooms || 0;
    }

    // Contar cuántas habitaciones están ocupadas en esta fecha específica
    const occupiedRooms = this.activeBookings.reduce((sum, booking) => {
      let bStart: Date;
      if (booking.checkIn.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [y, m, d] = booking.checkIn.split('-').map(Number);
        bStart = new Date(y, m - 1, d);
      } else {
        bStart = new Date(booking.checkIn);
      }

      let bEnd: Date;
      if (booking.checkOut.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [y, m, d] = booking.checkOut.split('-').map(Number);
        bEnd = new Date(y, m - 1, d);
      } else {
        bEnd = new Date(booking.checkOut);
      }

      // Normalizar a medianoche
      bStart.setHours(0, 0, 0, 0);
      bEnd.setHours(0, 0, 0, 0);

      // Si es el día 14, loguear para debug
      if (date.getDate() === 14 && date.getMonth() === 11) { // 11 es Diciembre
        // console.log('Checking day 14 Dec against booking:', booking.id, bStart, bEnd, date >= bStart && date < bEnd);
      }

      // Si la fecha actual está dentro del rango [checkIn, checkOut)
      if (date >= bStart && date < bEnd) {
        return sum + booking.rooms;
      }
      return sum;
    }, 0);

    // Debug para el día 14
    if (date.getDate() === 14 && date.getMonth() === 11) {
      console.log('Day 14 Dec: Occupied:', occupiedRooms, 'Capacity:', totalCapacity, 'Available:', (totalCapacity - occupiedRooms) >= this.numberOfRooms);
      console.log('Active Bookings:', this.activeBookings);
    }

    // Calcular disponibilidad restante
    const remainingRooms = totalCapacity - occupiedRooms;

    // Verificar si hay suficientes para la solicitud actual
    const isAvailable = remainingRooms >= this.numberOfRooms;

    // Precio: usar el de la habitación si está disponible, o el del hotel
    let price: number;
    if (this.selectedRoom && this.selectedRoom.rates && this.selectedRoom.rates.length > 0) {
      // Usar el precio de la primera tarifa de la habitación
      price = this.selectedRoom.rates[0].pricePerNight;
    } else {
      price = this.hotel.pricePerNight;
    }

    // Ajuste simple de precio fin de semana
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      price = Math.round(price * 1.15); // +15% findes
    }

    return { isAvailable, price: isAvailable ? price : null };
  }

  /**
   * Navega al mes anterior
   */
  prevMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  /**
   * Navega al mes siguiente
   */
  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  /**
   * Obtiene el nombre del mes actual
   */
  get monthName(): string {
    return this.currentMonth.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase());
  }

  /**
   * Texto de fechas y noches
   */
  get stayText(): string {
    return `${this.numberOfNights} noche${this.numberOfNights > 1 ? 's' : ''}`;
  }

  /**
   * Texto de habitaciones y huéspedes
   */
  get guestsText(): string {
    return `${this.numberOfRooms} habitación, ${this.adults + this.children} huésped${this.adults + this.children > 1 ? 'es' : ''}`;
  }

  /**
   * Selecciona una fecha
   */
  selectDate(day: CalendarDay): void {
    if (!day.isAvailable || !day.isCurrentMonth) return;

    this.selectedDate = day.date;
    this.generateCalendar(); // Actualizar selección visual
  }

  /**
   * Continúa a la selección de habitaciones
   */
  continue(): void {
    if (!this.selectedDate) return;

    // Calcular fecha de salida
    const checkOut = new Date(this.selectedDate);
    checkOut.setDate(checkOut.getDate() + this.numberOfNights);

    // Guardar parámetros de búsqueda
    this.bookingService.setSearchParams({
      checkIn: this.formatDate(this.selectedDate),
      checkOut: this.formatDate(checkOut),
      rooms: this.numberOfRooms,
      adults: this.adults,
      children: this.children
    });

    // Navegar a selección de habitaciones
    this.router.navigate(['/client/hotel', this.hotelId, 'rooms'], {
      queryParams: {
        checkIn: this.formatDate(this.selectedDate),
        checkOut: this.formatDate(checkOut),
        rooms: this.numberOfRooms,
        adults: this.adults,
        children: this.children
      }
    });
  }

  /**
   * Formatea una fecha a YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    // Usar formato local
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Vuelve a la búsqueda
   */
  goBack(): void {
    this.router.navigate(['/client/search-hotels']);
  }

  /**
   * Abre la búsqueda de actualizaciones
   */
  searchUpdates(): void {
    // Por ahora solo regenera el calendario
    this.generateCalendar();
  }
}
