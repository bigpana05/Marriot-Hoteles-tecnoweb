import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupBookingService } from '../../../core/services/group-booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { GroupHotel } from '../../../core/models/group-hotel.model';
import { CreateGroupBookingDTO, calculateGroupDiscount, EVENT_TYPES } from '../../../core/models/group-booking.model';

@Component({
  selector: 'app-group-request',
  templateUrl: './group-request.component.html',
  styleUrls: ['./group-request.component.scss']
})
export class GroupRequestComponent implements OnInit {
  hotel: GroupHotel | null = null;
  loading = false;
  error: string | null = null;

  // Datos del formulario
  eventName = '';
  eventType: 'business' | 'social' | 'wedding' = 'business';
  checkIn = '';
  checkOut = '';
  rooms = 10;
  attendees = 20;
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  company = '';

  // Dirección
  addressType: 'business' | 'personal' = 'business';
  companyName = '';
  addressLine1 = '';
  addressLine2 = '';
  country = '';
  city = '';
  state = '';
  postalCode = '';

  // Opciones de tipo de evento
  eventTypes = EVENT_TYPES;

  // Cálculos
  nights = 0;
  discount = 0;
  subtotal = 0;
  estimatedTotal = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupBookingService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const hotelId = this.route.snapshot.paramMap.get('id');
    if (hotelId) {
      this.loadHotel(hotelId);
    }

    // Cargar datos del usuario si está logueado
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.firstName = currentUser.firstName || '';
      this.lastName = currentUser.lastName || '';
      this.email = currentUser.email || '';
    }

    // Inicializar parámetros de búsqueda
    this.loadSearchParams();
  }

  loadSearchParams(): void {
    // Intentar cargar parámetros desde sessionStorage
    const savedParams = sessionStorage.getItem('groupSearchParams');
    console.log('Parámetros guardados en sessionStorage:', savedParams); // Debug

    if (savedParams) {
      try {
        const params = JSON.parse(savedParams);
        console.log('Parámetros parseados:', params); // Debug

        // Cargar fechas
        if (params.checkIn && params.checkOut) {
          const checkIn = new Date(params.checkIn);
          const checkOut = new Date(params.checkOut);
          this.checkIn = this.formatDateLocal(checkIn);
          this.checkOut = this.formatDateLocal(checkOut);
          console.log('Fechas cargadas:', this.checkIn, this.checkOut); // Debug
        } else {
          console.log('No hay fechas guardadas, usando por defecto'); // Debug
          this.setDefaultDates();
        }

        // Cargar rooms y attendees
        if (params.rooms !== null && params.rooms !== undefined) {
          this.rooms = params.rooms;
          console.log('Habitaciones cargadas:', this.rooms); // Debug
        }

        if (params.attendees !== null && params.attendees !== undefined) {
          this.attendees = params.attendees;
          console.log('Asistentes cargados:', this.attendees); // Debug
        }

        // Limpiar sessionStorage después de usarlo
        sessionStorage.removeItem('groupSearchParams');
      } catch (error) {
        console.error('Error al cargar parámetros guardados:', error);
        this.setDefaultDates();
      }
    } else {
      console.log('No hay parámetros guardados, usando valores por defecto'); // Debug
      this.setDefaultDates();
    }

    this.calculateTotals();
  }

  setDefaultDates(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 30);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 3);

    this.checkIn = this.formatDateLocal(tomorrow);
    this.checkOut = this.formatDateLocal(dayAfter);
  }

  formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadHotel(id: string | number): void {
    this.loading = true;
    this.error = null;
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    // Si no es un número válido, usar directamente el string
    const hotelId = isNaN(numericId) ? id : numericId;

    this.groupService.getGroupHotelById(hotelId as any).subscribe({
      next: hotel => {
        if (!hotel) {
          this.error = 'Hotel no encontrado. Por favor verifica el ID.';
          this.loading = false;
          return;
        }
        this.hotel = hotel;
        this.loading = false;
        this.calculateTotals();
      },
      error: (err) => {
        console.error('Error al cargar hotel:', err);
        this.error = 'Error al cargar el hotel. Por favor intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  calculateTotals(): void {
    if (!this.hotel || !this.checkIn || !this.checkOut) {
      return;
    }

    const checkInDate = new Date(this.checkIn);
    const checkOutDate = new Date(this.checkOut);
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    this.nights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    const currentUser = this.authService.getCurrentUser();
    const isMember = !!currentUser;

    this.discount = calculateGroupDiscount(this.rooms, isMember);
    this.subtotal = this.hotel.pricePerNight * this.nights * this.rooms;
    this.estimatedTotal = this.subtotal - (this.subtotal * this.discount / 100);
  }

  submitRequest(): void {
    if (!this.hotel) return;

    const dto: CreateGroupBookingDTO = {
      eventName: this.eventName,
      eventType: this.eventType,
      hotelId: this.hotel.id!,
      hotelName: this.hotel.name,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      rooms: this.rooms,
      attendees: this.attendees,
      contactInfo: {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        company: this.company
      },
      pricePerNight: this.hotel.pricePerNight
    };

    this.loading = true;
    this.error = null;

    this.groupService.createGroupBooking(dto).subscribe({
      next: booking => {
        this.router.navigate(['/client/groups/confirmation', booking.confirmationCode]);
      },
      error: () => {
        this.error = 'Error al enviar la solicitud. Por favor intenta nuevamente.';
        this.loading = false;
      }
    });
  }
}
