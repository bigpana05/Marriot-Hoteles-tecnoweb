import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-my-reservations',
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss']
})
export class MyReservationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  bookings: Booking[] = [];
  loading = true;
  cancellingId: string | number | null = null;
  showCancelModal = false;
  bookingToCancel: Booking | null = null;

  // Filtros
  activeFilter: 'all' | 'upcoming' | 'past' | 'cancelled' = 'all';

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadBookings();
        } else {
          // Si no hay usuario, redirigir a login o guest reservations
          this.router.navigate(['/client/guest-reservations']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBookings(): void {
    if (!this.currentUser?.id) return;

    this.loading = true;
    this.bookingService.getBookingsByUserId(this.currentUser.id.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.bookings = bookings.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  get filteredBookings(): Booking[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (this.activeFilter) {
      case 'upcoming':
        return this.bookings.filter(b => {
          const checkIn = new Date(b.checkIn);
          return checkIn >= today && b.status !== 'CANCELLED';
        });
      case 'past':
        return this.bookings.filter(b => {
          const checkOut = new Date(b.checkOut);
          return checkOut < today && b.status !== 'CANCELLED';
        });
      case 'cancelled':
        return this.bookings.filter(b => b.status === 'CANCELLED');
      default:
        return this.bookings;
    }
  }

  setFilter(filter: 'all' | 'upcoming' | 'past' | 'cancelled'): void {
    this.activeFilter = filter;
  }

  formatDate(dateString: string): string {
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    let date: Date;
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }

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
      'COMPLETED': 'Completada',
      'CHECKED_IN': 'Check-in Completado'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'CANCELLED': 'status-cancelled',
      'COMPLETED': 'status-completed',
      'CHECKED_IN': 'status-checkedin'
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
            // Actualizar la lista local
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

  /**
   * Verifica si una reserva puede hacer check-in digital
   */
  canCheckIn(booking: Booking): boolean {
    const result = this.bookingService.canPerformCheckIn(booking);
    return result.canCheckIn;
  }

  /**
   * Navega al check-in digital
   */
  goToCheckIn(booking: Booking): void {
    if (booking.confirmationCode) {
      this.router.navigate(['/client/check-in', booking.confirmationCode]);
    }
  }

  goToHome(): void {
    this.router.navigate(['/client/home']);
  }
}
