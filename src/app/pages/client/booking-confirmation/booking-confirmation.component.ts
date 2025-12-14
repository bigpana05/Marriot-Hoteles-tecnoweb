import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.scss']
})
export class BookingConfirmationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  booking: Booking | null = null;
  loading = true;
  error: string | null = null;
  currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.currentUser = user);

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const code = params['code'];
        if (code) {
          this.loadBooking(code);
        } else {
          this.error = 'Código de confirmación no válido';
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBooking(code: string): void {
    this.bookingService.getBookingByConfirmationCode(code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (booking) => {
          if (booking) {
            this.booking = booking;
          } else {
            this.error = 'No se encontró la reserva';
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Error al cargar la reserva';
          this.loading = false;
        }
      });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  goToMyReservations(): void {
    if (this.currentUser) {
      this.router.navigate(['/client/my-reservations']);
    } else {
      this.router.navigate(['/client/guest-reservations']);
    }
  }

  goToHome(): void {
    this.router.navigate(['/client/home']);
  }

  printConfirmation(): void {
    window.print();
  }
}
