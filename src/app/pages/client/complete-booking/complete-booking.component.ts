import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Room, RoomRate } from '../../../core/models/room.model';
import { Booking, BookingSummary, GuestInfo, PaymentInfo, PaymentMethod } from '../../../core/models/booking.model';
import { HotelSearchResult } from '../../../core/models/hotel-search.model';
import { BookingService } from '../../../core/services/booking.service';
import { SearchHotelService } from '../../../core/services/search-hotel.service';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Componente para completar la reserva de hotel
 * Formulario con datos del huésped, dirección y pago
 */
@Component({
  selector: 'app-complete-booking',
  templateUrl: './complete-booking.component.html',
  styleUrls: ['./complete-booking.component.scss']
})
export class CompleteBookingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos del hotel y habitación
  hotelId: number = 0;
  roomId: number = 0;
  rateId: string = '';
  hotel: HotelSearchResult | null = null;
  room: Room | null = null;
  selectedRate: RoomRate | null = null;

  // Resumen de la reserva
  bookingSummary: BookingSummary | null = null;

  // Estado del usuario
  isLoggedIn = false;
  isMember = false;

  // Registro de nuevo miembro
  wantsToJoin = false;
  memberPassword = '';
  memberConfirmPassword = '';
  passwordError = '';
  showRegistrationSuccess = false;
  showRegistrationError = false;
  registrationMessage = '';

  // Formulario - Información del huésped
  guestInfo: GuestInfo = {
    firstName: '',
    lastName: '',
    email: '',
    memberNumber: '',
    sendSmsConfirmation: false,
    country: 'España',
    postalCode: '',
    city: '',
    addressLine1: '',
    addressLine2: ''
  };

  // Formulario - Información de pago
  paymentInfo: PaymentInfo = {
    method: 'credit-card',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    acceptTerms: false,
    receivePromotions: false,
    shareData: false
  };

  // Lista de países
  countries: string[] = [
    'España', 'Chile', 'Argentina', 'México', 'Colombia', 'Perú',
    'Estados Unidos', 'Brasil', 'Francia', 'Italia', 'Alemania', 'Reino Unido'
  ];

  // Meses y años para tarjeta
  months: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  years: string[] = [];

  // Estado de la reserva
  isSubmitting = false;
  bookingConfirmed = false;
  confirmedBooking: Booking | null = null;

  // Política de cancelación
  cancellationDate: string = '';
  cancellationFee: number = 0;

  // Timer de reserva
  timerMinutes = 15;
  timerSeconds = 0;
  private timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private searchHotelService: SearchHotelService,
    private authService: AuthService
  ) {
    // Generar años (actual + 10)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 10; i++) {
      this.years.push((currentYear + i).toString());
    }
  }

  ngOnInit(): void {
    this.loadRouteParams();
    this.loadBookingSummary();
    this.checkAuthStatus();
    this.calculateCancellationPolicy();
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
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
        this.roomId = +params['roomId'];
        this.rateId = params['rateId'];
        if (this.roomId) {
          this.loadRoomData();
        }
      });
  }

  /**
   * Carga el resumen de la reserva
   */
  private loadBookingSummary(): void {
    this.bookingSummary = this.bookingService.getBookingSummary();
    if (!this.bookingSummary) {
      // Si no hay resumen, redirigir a búsqueda
      this.router.navigate(['/client/search-hotels']);
    }
  }

  /**
   * Verifica el estado de autenticación
   */
  private checkAuthStatus(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
        this.isMember = !!user?.bonvoyNumber;
        if (user) {
          // Pre-llenar datos del usuario
          this.guestInfo.firstName = user.firstName || user.name?.split(' ')[0] || '';
          this.guestInfo.lastName = user.lastName || user.name?.split(' ').slice(1).join(' ') || '';
          this.guestInfo.email = user.email || '';
          // Auto-llenar número de miembro Bonvoy
          this.guestInfo.memberNumber = user.bonvoyNumber || '';
        } else {
          // Limpiar número de miembro si no está logueado
          this.guestInfo.memberNumber = '';
        }
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
      });
  }

  /**
   * Carga los datos de la habitación
   */
  private loadRoomData(): void {
    this.bookingService.getRoomById(this.roomId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(room => {
        this.room = room;
        if (room && this.rateId) {
          this.selectedRate = room.rates.find(r => r.id === this.rateId) || null;
        }
      });
  }

  /**
   * Calcula la política de cancelación
   */
  private calculateCancellationPolicy(): void {
    if (this.bookingSummary) {
      const checkInDate = new Date(this.bookingSummary.checkIn);
      const cancellationLimit = new Date(checkInDate);
      cancellationLimit.setDate(cancellationLimit.getDate() - 2);
      this.cancellationDate = this.formatCancellationDate(cancellationLimit);
      this.cancellationFee = Math.round(this.bookingSummary.totalPrice * 0.5);
    }
  }

  /**
   * Formatea la fecha de cancelación
   */
  private formatCancellationDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
  }

  /**
   * Obtiene el texto de las fechas de estancia
   */
  get stayDatesText(): string {
    if (!this.bookingSummary) return '';
    return `${this.bookingService.formatDisplayDate(this.bookingSummary.checkIn)} - ${this.bookingService.formatDisplayDate(this.bookingSummary.checkOut)}`;
  }

  /**
   * Cambia el método de pago
   */
  selectPaymentMethod(method: PaymentMethod): void {
    this.paymentInfo.method = method;
  }

  /**
   * Valida el formulario
   */
  isFormValid(): boolean {
    const guestValid =
      this.guestInfo.firstName.trim() !== '' &&
      this.guestInfo.lastName.trim() !== '' &&
      this.guestInfo.email.trim() !== '' &&
      this.guestInfo.country.trim() !== '' &&
      this.guestInfo.postalCode.trim() !== '' &&
      this.guestInfo.city.trim() !== '' &&
      this.guestInfo.addressLine1.trim() !== '';

    const paymentValid =
      this.paymentInfo.method === 'credit-card'
        ? (this.paymentInfo.cardNumber?.trim() !== '' &&
          this.paymentInfo.expiryMonth !== '' &&
          this.paymentInfo.expiryYear !== '')
        : true;

    return guestValid && paymentValid && this.paymentInfo.acceptTerms;
  }

  /**
   * Envía la reserva
   */
  submitBooking(): void {
    if (!this.isFormValid() || !this.bookingSummary) return;

    this.isSubmitting = true;

    // Obtener usuario actual y parámetros de búsqueda
    const searchParams = this.bookingService.getSearchParams();
    const currentUser = this.authService.getCurrentUser();

    const bookingData = {
      hotelId: this.hotelId,
      roomId: this.roomId,
      rateId: this.rateId,
      checkIn: this.bookingSummary.checkIn,
      checkOut: this.bookingSummary.checkOut,
      rooms: this.bookingSummary.rooms,
      adults: this.bookingSummary.adults,
      children: searchParams?.children || 0,
      guestInfo: this.guestInfo,
      paymentInfo: {
        ...this.paymentInfo,
        cardLastFour: this.paymentInfo.cardNumber?.slice(-4)
      },
      isMember: this.isMember || !!this.guestInfo.memberNumber || !!currentUser,
      userId: currentUser?.id?.toString() || null,
      guestId: null,
      hotelName: this.hotel?.name || this.bookingSummary.hotelName,
      roomName: this.room?.name || this.bookingSummary.roomName,
      rateName: this.selectedRate?.name || this.bookingSummary.rateName,
      pricePerNight: this.bookingSummary.pricePerNight,
      totalPrice: this.bookingSummary.totalPrice,
      currency: this.bookingSummary.currency
    };

    // Simular delay de procesamiento
    setTimeout(() => {
      this.bookingService.createBooking(bookingData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (confirmedBooking) => {
            this.confirmedBooking = confirmedBooking;
            this.bookingConfirmed = true;
            this.isSubmitting = false;
            // Redirigir a la página de confirmación
            if (confirmedBooking.confirmationCode) {
              this.router.navigate(['/client/booking-confirmation', confirmedBooking.confirmationCode]);
            }
          },
          error: (error) => {
            console.error('Error al crear reserva:', error);
            this.isSubmitting = false;
          }
        });
    }, 1500);
  }

  /**
   * Abre los detalles de la habitación
   */
  openRoomDetails(): void {
    // Por ahora solo navegamos de vuelta
    this.router.navigate(['/client/hotel', this.hotelId, 'rooms']);
  }

  /**
   * Edita los detalles de la estancia
   */
  editStayDetails(): void {
    this.router.navigate(['/client/hotel', this.hotelId, 'rooms']);
  }

  /**
   * Vuelve al inicio
   */
  goToHome(): void {
    this.router.navigate(['/client/home']);
  }

  /**
   * Ve las reservas del usuario
   */
  viewMyBookings(): void {
    this.router.navigate(['/client/profile']);
  }

  /**
   * Valida las contraseñas del registro
   */
  validatePasswords(): boolean {
    this.passwordError = '';

    if (this.memberPassword.length < 8) {
      this.passwordError = 'La contraseña debe tener al menos 8 caracteres';
      return false;
    }

    if (this.memberPassword !== this.memberConfirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden';
      return false;
    }

    return true;
  }

  /**
   * Registra un nuevo miembro de Marriott Bonvoy
   */
  registerMember(): void {
    if (!this.validatePasswords()) {
      return;
    }

    if (!this.guestInfo.firstName || !this.guestInfo.lastName || !this.guestInfo.email) {
      this.showRegistrationError = true;
      this.registrationMessage = 'Por favor complete la información del huésped antes de registrarse';
      setTimeout(() => {
        this.showRegistrationError = false;
      }, 4000);
      return;
    }

    // Datos del nuevo usuario
    const userData = {
      firstName: this.guestInfo.firstName,
      lastName: this.guestInfo.lastName,
      email: this.guestInfo.email,
      password: this.memberPassword
    };

    // Llamar al servicio de autenticación para registrar
    this.authService.register(userData)
      .then(newUser => {
        this.isLoggedIn = true;
        this.isMember = true;
        this.wantsToJoin = false;
        this.guestInfo.memberNumber = newUser.bonvoyNumber || '';
        this.showRegistrationSuccess = true;
        this.registrationMessage = `¡Cuenta creada exitosamente! Tu número de miembro es: ${newUser.bonvoyNumber}`;

        setTimeout(() => {
          this.showRegistrationSuccess = false;
        }, 5000);
      })
      .catch(error => {
        this.showRegistrationError = true;
        this.registrationMessage = error.message || 'Error al crear la cuenta. Inténtalo de nuevo.';
        setTimeout(() => {
          this.showRegistrationError = false;
        }, 4000);
      });
  }

  /**
   * Cierra el mensaje de registro
   */
  closeRegistrationMessage(): void {
    this.showRegistrationSuccess = false;
    this.showRegistrationError = false;
  }

  /**
   * Inicia el contador de tiempo de reserva
   */
  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
      } else {
        if (this.timerMinutes > 0) {
          this.timerMinutes--;
          this.timerSeconds = 59;
        } else {
          // Tiempo expirado
          clearInterval(this.timerInterval);
          this.handleTimerExpiration();
        }
      }
    }, 1000);
  }

  /**
   * Maneja la expiración del tiempo de reserva
   */
  private handleTimerExpiration(): void {
    alert('El tiempo de reserva ha expirado. Por favor, selecciona la habitación nuevamente.');
    // Redirigir a la selección de habitaciones del hotel
    // Se usa queryParams si el bookingSummary tiene roomId, aunque lo ideal es volver al listado
    if (this.hotelId) {
      this.router.navigate(['/client/hotel', this.hotelId, 'rooms']);
    } else {
      this.router.navigate(['/client/search-hotels']);
    }
  }
}
