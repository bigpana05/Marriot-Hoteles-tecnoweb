import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-guest-reservations',
  templateUrl: './guest-reservations.component.html',
  styleUrls: ['./guest-reservations.component.scss']
})
export class GuestReservationsComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  // Formulario de búsqueda
  searchEmail = '';
  searchCode = '';

  // Resultados
  bookings: Booking[] = [];
  singleBooking: Booking | null = null;
  hasSearched = false;
  loading = false;
  error: string | null = null;

  // Modal de cancelación
  showCancelModal = false;
  bookingToCancel: Booking | null = null;
  cancellingId: string | number | null = null;

  constructor(
    private router: Router,
    private bookingService: BookingService
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  searchByEmail(): void {
    if (!this.searchEmail.trim()) {
      this.error = 'Por favor ingresa un correo electrónico';
      return;
    }

    this.loading = true;
    this.error = null;
    this.singleBooking = null;

    this.bookingService.getBookingsByEmail(this.searchEmail.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.bookings = bookings.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.hasSearched = true;
          this.loading = false;

          if (bookings.length === 0) {
            this.error = 'No se encontraron reservas con este correo electrónico';
          }
        },
        error: () => {
          this.error = 'Error al buscar reservas';
          this.loading = false;
          this.hasSearched = true;
        }
      });
  }

  searchByCode(): void {
    if (!this.searchCode.trim()) {
      this.error = 'Por favor ingresa un código de confirmación';
      return;
    }

    this.loading = true;
    this.error = null;
    this.bookings = [];

    this.bookingService.getBookingByConfirmationCode(this.searchCode.trim().toUpperCase())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (booking) => {
          if (booking) {
            this.singleBooking = booking;
          } else {
            this.error = 'No se encontró una reserva con este código';
          }
          this.hasSearched = true;
          this.loading = false;
        },
        error: () => {
          this.error = 'Error al buscar la reserva';
          this.loading = false;
          this.hasSearched = true;
        }
      });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'CANCELLED': 'Cancelada',
      'COMPLETED': 'Completada'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'CANCELLED': 'status-cancelled',
      'COMPLETED': 'status-completed'
    };
    return classMap[status] || '';
  }

  canCancel(booking: Booking): boolean {
    return this.bookingService.canCancelBooking(booking);
  }

  openCancelModal(booking: Booking): void {
    this.bookingToCancel = booking;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.bookingToCancel = null;
  }

  confirmCancel(): void {
    if (!this.bookingToCancel?.id) return;

    this.cancellingId = this.bookingToCancel.id;
    this.bookingService.cancelBooking(this.bookingToCancel.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            // Actualizar reserva única
            if (this.singleBooking?.id === this.bookingToCancel?.id) {
              this.singleBooking = { ...this.singleBooking, status: 'CANCELLED' } as Booking;
            }
            // Actualizar lista de reservas
            const index = this.bookings.findIndex(b => b.id === this.bookingToCancel?.id);
            if (index !== -1) {
              this.bookings[index] = { ...this.bookings[index], status: 'CANCELLED' };
            }
          }
          this.cancellingId = null;
          this.closeCancelModal();
        },
        error: () => {
          this.cancellingId = null;
          this.closeCancelModal();
        }
      });
  }

  viewDetails(booking: Booking): void {
    if (booking.confirmationCode) {
      this.router.navigate(['/client/booking-confirmation', booking.confirmationCode]);
    }
  }

  clearSearch(): void {
    this.searchEmail = '';
    this.searchCode = '';
    this.bookings = [];
    this.singleBooking = null;
    this.hasSearched = false;
    this.error = null;
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
