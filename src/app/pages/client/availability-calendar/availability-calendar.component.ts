import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HotelSearchResult } from '../../../core/models/hotel-search.model';
import { SearchHotelService } from '../../../core/services/search-hotel.service';
import { BookingService } from '../../../core/services/booking.service';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  price: number | null;
  isSelected: boolean;
  isPast: boolean;
}

interface CalendarWeek {
  days: CalendarDay[];
}

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
  ) {}

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
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.hotelId = +params['id'];
        this.loadHotelData();
      });

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.numberOfRooms = +params['rooms'] || 1;
        this.adults = +params['adults'] || 1;
        this.children = +params['children'] || 0;
        this.numberOfNights = +params['nights'] || 1;
        
        // Cargar el mes actual o el especificado
        if (params['month'] && params['year']) {
          this.currentMonth = new Date(+params['year'], +params['month'] - 1, 1);
        } else {
          this.currentMonth = new Date();
        }
        
        this.generateCalendar();
      });
  }

  /**
   * Carga los datos del hotel
   */
  private loadHotelData(): void {
    this.searchHotelService.getHotelById(this.hotelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(hotel => {
        this.hotel = hotel ?? null;
        this.isLoading = false;
      });
  }

  /**
   * Genera el calendario del mes actual
   */
  private generateCalendar(): void {
    this.calendarWeeks = [];
    
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Día de la semana del primer día (0 = domingo, ajustamos para lunes = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentWeek: CalendarDay[] = [];
    
    // Días del mes anterior para llenar la primera semana
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
      const isPast = date < today;
      
      // Simular disponibilidad (en producción vendría de la API)
      const availability = this.getSimulatedAvailability(date, isPast);
      
      currentWeek.push({
        date: date,
        dayNumber: day,
        isCurrentMonth: true,
        isAvailable: availability.isAvailable,
        price: availability.price,
        isSelected: this.selectedDate?.getTime() === date.getTime(),
        isPast: isPast
      });
      
      // Si completamos una semana, crear nueva
      if (currentWeek.length === 7) {
        this.calendarWeeks.push({ days: currentWeek });
        currentWeek = [];
      }
    }
    
    // Días del mes siguiente para completar la última semana
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
   * Simula la disponibilidad de una fecha
   * En producción esto vendría del backend
   */
  private getSimulatedAvailability(date: Date, isPast: boolean): { isAvailable: boolean; price: number | null } {
    if (isPast) {
      return { isAvailable: false, price: null };
    }
    
    // Simular algunas fechas no disponibles (ej: primeros 4 días después de hoy)
    const today = new Date();
    const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 4) {
      return { isAvailable: false, price: null };
    }
    
    // Simular precios variables
    const dayOfWeek = date.getDay();
    let price = this.basePrice;
    
    // Fines de semana más caros
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      price = this.basePrice + 38; // €342
    }
    
    // Algunos días especiales más caros
    if (date.getDate() === 11) {
      price = this.basePrice + 61; // €365
    }
    if (date.getDate() === 12) {
      price = this.basePrice + 95; // €399
    }
    
    return { isAvailable: true, price: price };
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
    return date.toISOString().split('T')[0];
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
