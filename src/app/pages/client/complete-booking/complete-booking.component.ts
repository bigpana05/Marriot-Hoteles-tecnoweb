import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Room, RoomRate } from '../../../core/models/room.model';
import {
  Booking,
  BookingSummary,
  GuestInfo,
  PaymentInfo,
  PaymentMethod,
} from '../../../core/models/booking.model';
import { HotelSearchResult } from '../../../core/models/hotel-search.model';
import { BookingService } from '../../../core/services/booking.service';
import { SearchHotelService } from '../../../core/services/search-hotel.service';
import { AuthService } from '../../../core/services/auth.service';
import { CouponService } from '../../../core/services/coupon.service';
import { Coupon } from '../../../core/models/coupon.model';

@Component({
  selector: 'app-complete-booking',
  templateUrl: './complete-booking.component.html',
  styleUrls: ['./complete-booking.component.scss'],
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

  // Variables para Cupones
  couponCode: string = '';
  appliedCoupon: Coupon | null = null;
  discountAmount: number = 0;
  finalPrice: number = 0;
  couponMessage: string = '';
  couponMessageType: 'success' | 'error' | '' = '';

  // Estado del usuario
  isLoggedIn = false;
  isMember = false;

  // Registro
  wantsToJoin = false;
  memberPassword = '';
  memberConfirmPassword = '';
  passwordError = '';
  showRegistrationSuccess = false;
  showRegistrationError = false;
  registrationMessage = '';

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
    addressLine2: '',
  };

  paymentInfo: PaymentInfo = {
    method: 'credit-card',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    acceptTerms: false,
    receivePromotions: false,
    shareData: false,
  };

  countries: string[] = [
    'España',
    'Chile',
    'Argentina',
    'México',
    'Colombia',
    'Perú',
    'Estados Unidos',
    'Brasil',
    'Francia',
    'Italia',
    'Alemania',
    'Reino Unido',
  ];

  months: string[] = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
  ];
  years: string[] = [];

  isSubmitting = false;
  bookingConfirmed = false;
  confirmedBooking: Booking | null = null;

  cancellationDate: string = '';
  cancellationFee: number = 0;

  timerMinutes = 15;
  timerSeconds = 0;
  private timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private searchHotelService: SearchHotelService,
    private authService: AuthService,
    private couponService: CouponService
  ) {
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

  private loadRouteParams(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.hotelId = +params['id'];
      this.loadHotelData();
    });

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.roomId = +params['roomId'];
        this.rateId = params['rateId'];
        if (this.roomId) {
          this.loadRoomData();
        }
      });
  }

  private loadBookingSummary(): void {
    this.bookingSummary = this.bookingService.getBookingSummary();
    if (!this.bookingSummary) {
      this.router.navigate(['/client/search-hotels']);
    } else {
      this.finalPrice = this.bookingSummary.totalPrice;
    }
  }

  private checkAuthStatus(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.isLoggedIn = !!user;
        this.isMember = !!user?.bonvoyNumber;
        if (user) {
          this.guestInfo.firstName =
            user.firstName || user.name?.split(' ')[0] || '';
          this.guestInfo.lastName =
            user.lastName || user.name?.split(' ').slice(1).join(' ') || '';
          this.guestInfo.email = user.email || '';
          this.guestInfo.memberNumber = user.bonvoyNumber || '';
          this.guestInfo.country = user.country || 'España';
          this.guestInfo.postalCode = user.postalCode || '';
          this.guestInfo.city = user.city || '';
          this.guestInfo.addressLine1 = user.addressLine1 || '';
          this.guestInfo.addressLine2 = user.addressLine2 || '';
        } else {
          this.guestInfo.memberNumber = '';
        }
      });
  }

  private loadHotelData(): void {
    this.searchHotelService
      .getHotelById(this.hotelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((hotel) => {
        this.hotel = hotel ?? null;
      });
  }

  private loadRoomData(): void {
    this.bookingService
      .getRoomById(this.roomId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((room) => {
        this.room = room;
        if (room && this.rateId) {
          this.selectedRate =
            room.rates.find((r) => r.id === this.rateId) || null;
        }
      });
  }

  private calculateCancellationPolicy(): void {
    if (this.bookingSummary) {
      const checkInDate = new Date(this.bookingSummary.checkIn);
      const cancellationLimit = new Date(checkInDate);
      cancellationLimit.setDate(cancellationLimit.getDate() - 2);
      this.cancellationDate = this.formatCancellationDate(cancellationLimit);
      this.cancellationFee = Math.round(this.bookingSummary.totalPrice * 0.5);
    }
  }

  private formatCancellationDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    return date.toLocaleDateString('es-ES', options);
  }

  get stayDatesText(): string {
    if (!this.bookingSummary) return '';
    return `${this.bookingService.formatDisplayDate(
      this.bookingSummary.checkIn
    )} - ${this.bookingService.formatDisplayDate(
      this.bookingSummary.checkOut
    )}`;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.paymentInfo.method = method;
  }

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
        ? this.paymentInfo.cardNumber?.trim() !== '' &&
          this.paymentInfo.expiryMonth !== '' &&
          this.paymentInfo.expiryYear !== ''
        : true;

    return guestValid && paymentValid && this.paymentInfo.acceptTerms;
  }

  // ==========================================
  // 👇 LOGICA DE CUPONES ACTUALIZADA
  // ==========================================

  applyCoupon(): void {
    this.resetCouponState();

    if (!this.couponCode.trim()) return;

    // 1. Validar que tengamos un email para verificar historial
    if (!this.guestInfo.email) {
      this.showCouponError(
        'Por favor ingresa tu correo electrónico primero para validar el cupón.'
      );
      return;
    }

    const codeToVerify = this.couponCode.trim().toUpperCase();

    // 2. Obtener cupones del sistema
    this.couponService.getAll().subscribe({
      next: (coupons) => {
        const foundCoupon = coupons.find((c) => c.code === codeToVerify);

        // Validaciones básicas del cupón
        if (!foundCoupon) {
          this.showCouponError('Código de cupón no válido.');
          return;
        }
        if (!foundCoupon.isActive) {
          this.showCouponError('Este cupón ya no está activo.');
          return;
        }

        // Validación de fecha (Local Time)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        if (foundCoupon.validUntil < today) {
          this.showCouponError('Este cupón ha expirado.');
          return;
        }

        // 3. Verificar si el usuario YA USÓ este cupón
        this.verifyCouponHistory(
          this.guestInfo.email,
          codeToVerify,
          foundCoupon
        );
      },
      error: () => this.showCouponError('Error al verificar el cupón.'),
    });
  }

  private verifyCouponHistory(
    email: string,
    code: string,
    coupon: Coupon
  ): void {
    this.bookingService.getBookingsByEmail(email).subscribe({
      next: (bookings) => {
        // Buscamos en las reservas activas o completadas si ya usó este código
        // (Ignoramos las canceladas si quieres permitir re-uso tras cancelar)
        const alreadyUsed = bookings.some(
          (b) => (b as any).couponCode === code && b.status !== 'CANCELLED'
        );

        if (alreadyUsed) {
          this.showCouponError(
            'Ya has utilizado este cupón en una reserva anterior.'
          );
        } else {
          // Si pasa todas las pruebas, aplicamos el descuento
          this.calculateDiscount(coupon);
        }
      },
      error: () =>
        this.showCouponError('No se pudo verificar tu historial de cupones.'),
    });
  }

  private calculateDiscount(coupon: Coupon): void {
    if (!this.bookingSummary) return;

    this.appliedCoupon = coupon;
    const original = this.bookingSummary.totalPrice;

    if (coupon.discountType === 'PERCENTAGE') {
      this.discountAmount = Math.round(original * (coupon.discountValue / 100));
    } else {
      this.discountAmount = coupon.discountValue;
    }

    // Evitar negativos
    if (this.discountAmount > original) {
      this.discountAmount = original;
    }

    this.finalPrice = original - this.discountAmount;
    this.couponMessage = `¡Cupón aplicado! Ahorras ${this.discountAmount} ${this.bookingSummary.currency}`;
    this.couponMessageType = 'success';
  }

  removeCoupon(): void {
    this.resetCouponState();
    if (this.bookingSummary) {
      this.finalPrice = this.bookingSummary.totalPrice;
    }
  }

  private resetCouponState(): void {
    this.appliedCoupon = null;
    this.discountAmount = 0;
    this.couponMessage = '';
    this.couponMessageType = '';
  }

  private showCouponError(msg: string): void {
    this.couponMessage = msg;
    this.couponMessageType = 'error';
    this.appliedCoupon = null;
  }

  // ==========================================

  submitBooking(): void {
    if (!this.isFormValid() || !this.bookingSummary) return;

    this.isSubmitting = true;

    const searchParams = this.bookingService.getSearchParams();
    const currentUser = this.authService.getCurrentUser();

    // Incluimos los datos del cupón en la reserva para el historial
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
        cardLastFour: this.paymentInfo.cardNumber?.slice(-4),
      },
      isMember: this.isMember || !!this.guestInfo.memberNumber || !!currentUser,
      userId: currentUser?.id?.toString() || null,
      guestId: null,
      hotelName: this.hotel?.name || this.bookingSummary.hotelName,
      roomName: this.room?.name || this.bookingSummary.roomName,
      rateName: this.selectedRate?.name || this.bookingSummary.rateName,
      pricePerNight: this.bookingSummary.pricePerNight,

      // PRECIOS FINALES Y DATOS DE CUPÓN
      totalPrice: this.finalPrice,
      originalPrice: this.bookingSummary.totalPrice,
      discountAmount: this.discountAmount,
      couponCode: this.appliedCoupon ? this.appliedCoupon.code : null, // Guardamos el código usado

      currency: this.bookingSummary.currency,
    };

    setTimeout(() => {
      this.bookingService
        .createBooking(bookingData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (confirmedBooking) => {
            this.confirmedBooking = confirmedBooking;
            this.bookingConfirmed = true;
            this.isSubmitting = false;
            if (confirmedBooking.confirmationCode) {
              this.router.navigate([
                '/client/booking-confirmation',
                confirmedBooking.confirmationCode,
              ]);
            }
          },
          error: (error) => {
            console.error('Error al crear reserva:', error);
            this.isSubmitting = false;
          },
        });
    }, 1500);
  }

  // ... (Resto de métodos sin cambios: openRoomDetails, registerMember, startTimer, etc.)
  openRoomDetails(): void {
    this.router.navigate(['/client/hotel', this.hotelId, 'rooms']);
  }

  editStayDetails(): void {
    this.router.navigate(['/client/hotel', this.hotelId, 'rooms']);
  }

  goToHome(): void {
    this.router.navigate(['/client/home']);
  }

  viewMyBookings(): void {
    this.router.navigate(['/client/profile']);
  }

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

  registerMember(): void {
    if (!this.validatePasswords()) return;
    if (
      !this.guestInfo.firstName ||
      !this.guestInfo.lastName ||
      !this.guestInfo.email
    ) {
      this.showRegistrationError = true;
      this.registrationMessage =
        'Por favor complete la información del huésped antes de registrarse';
      setTimeout(() => {
        this.showRegistrationError = false;
      }, 4000);
      return;
    }
    const userData = {
      firstName: this.guestInfo.firstName,
      lastName: this.guestInfo.lastName,
      email: this.guestInfo.email,
      password: this.memberPassword,
    };
    this.authService
      .register(userData)
      .then((newUser) => {
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
      .catch((error) => {
        this.showRegistrationError = true;
        this.registrationMessage =
          error.message || 'Error al crear la cuenta. Inténtalo de nuevo.';
        setTimeout(() => {
          this.showRegistrationError = false;
        }, 4000);
      });
  }

  closeRegistrationMessage(): void {
    this.showRegistrationSuccess = false;
    this.showRegistrationError = false;
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
      } else {
        if (this.timerMinutes > 0) {
          this.timerMinutes--;
          this.timerSeconds = 59;
        } else {
          clearInterval(this.timerInterval);
          this.handleTimerExpiration();
        }
      }
    }, 1000);
  }

  private handleTimerExpiration(): void {
    alert(
      'El tiempo de reserva ha expirado. Por favor, selecciona la habitación nuevamente.'
    );
    if (this.hotelId) {
      this.router.navigate(['/client/hotel', this.hotelId, 'rooms']);
    } else {
      this.router.navigate(['/client/search-hotels']);
    }
  }
}
