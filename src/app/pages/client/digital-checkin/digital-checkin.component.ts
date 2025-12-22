import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingService } from '../../../core/services/booking.service';
import { Booking, CheckInData } from '../../../core/models/booking.model';

/**
 * Componente para el check-in digital anticipado
 * Permite a los huéspedes completar el check-in antes de llegar al hotel
 */
@Component({
  selector: 'app-digital-checkin',
  templateUrl: './digital-checkin.component.html',
  styleUrls: ['./digital-checkin.component.scss']
})
export class DigitalCheckinComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  confirmationCode = '';
  booking: Booking | null = null;
  loading = true;
  error = '';

  // Estado del formulario
  estimatedArrivalTime = '15:00';
  floorPreference: 'high' | 'low' | 'none' = 'none';
  specialRequests = '';
  identificationNumber = '';
  vehiclePlate = '';
  acceptedPolicies = false;

  // Estado de la operación
  isSubmitting = false;
  checkInCompleted = false;
  successMessage = '';
  errorMessage = '';

  // Disponibilidad
  canCheckIn = false;
  checkInReason = '';

  // Opciones de hora
  timeOptions: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {
    this.generateTimeOptions();
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.confirmationCode = params['confirmationCode'];
        if (this.confirmationCode) {
          this.loadBooking();
        } else {
          this.error = 'Código de confirmación no proporcionado';
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Genera las opciones de hora de llegada (cada 30 minutos desde 06:00 hasta 23:30)
   */
  private generateTimeOptions(): void {
    for (let hour = 6; hour <= 23; hour++) {
      this.timeOptions.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 23) {
        this.timeOptions.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
  }

  /**
   * Carga la reserva por código de confirmación
   */
  private loadBooking(): void {
    this.loading = true;
    this.bookingService.getBookingByConfirmationCode(this.confirmationCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (booking) => {
          if (booking) {
            this.booking = booking;
            this.checkEligibility();
          } else {
            this.error = 'No se encontró ninguna reserva con este código de confirmación';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar la reserva. Por favor, intenta de nuevo.';
          this.loading = false;
          console.error('Error loading booking:', err);
        }
      });
  }

  /**
   * Verifica si la reserva es elegible para check-in digital
   */
  private checkEligibility(): void {
    if (!this.booking) return;

    const result = this.bookingService.canPerformCheckIn(this.booking);
    this.canCheckIn = result.canCheckIn;
    this.checkInReason = result.reason || '';
  }

  /**
   * Envía el formulario de check-in
   */
  submitCheckIn(): void {
    if (!this.booking || !this.validateForm()) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const checkInData: CheckInData = {
      estimatedArrivalTime: this.estimatedArrivalTime,
      floorPreference: this.floorPreference,
      specialRequests: this.specialRequests.trim(),
      acceptedPolicies: this.acceptedPolicies,
      identificationNumber: this.identificationNumber.trim(),
      vehiclePlate: this.vehiclePlate.trim(),
      completedAt: new Date().toISOString()
    };

    this.bookingService.performCheckIn(this.booking.id!, checkInData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedBooking) => {
          this.booking = updatedBooking;
          this.checkInCompleted = true;
          this.isSubmitting = false;
          this.successMessage = '¡Check-in completado exitosamente!';
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || 'Error al procesar el check-in. Por favor, intenta de nuevo.';
          console.error('Error during check-in:', err);
        }
      });
  }

  /**
   * Valida el formulario antes de enviar
   */
  private validateForm(): boolean {
    if (!this.estimatedArrivalTime) {
      this.errorMessage = 'Por favor, selecciona una hora estimada de llegada';
      return false;
    }

    if (!this.acceptedPolicies) {
      this.errorMessage = 'Debes aceptar las políticas del hotel para continuar';
      return false;
    }

    return true;
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatDate(dateString: string): string {
    return this.bookingService.formatDisplayDate(dateString);
  }

  /**
   * Navega a Mis Reservas
   */
  goToMyReservations(): void {
    this.router.navigate(['/client/my-reservations']);
  }

  /**
   * Navega al inicio
   */
  goToHome(): void {
    this.router.navigate(['/client/home']);
  }

  /**
   * Imprime la confirmación de check-in
   */
  printConfirmation(): void {
    window.print();
  }
}
