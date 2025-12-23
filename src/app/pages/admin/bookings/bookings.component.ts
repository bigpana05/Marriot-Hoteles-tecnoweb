import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class AdminBookingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  bookings: Booking[] = [];
  loading = true;
  error: string | null = null;
  
  // Filters
  statusFilter: string = 'all';
  searchTerm: string = '';
  
  // Cancel modal
  showCancelModal = false;
  bookingToCancel: Booking | null = null;
  cancellingId: string | number | null = null;
  
  // Detail modal
  showDetailModal = false;
  selectedBooking: Booking | null = null;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookings(): void {
    this.loading = true;
    this.error = null;
    
    this.bookingService.getAllBookings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.bookings = bookings;
          this.loading = false;
        },
        error: () => {
          this.error = 'Error al cargar las reservas';
          this.loading = false;
        }
      });
  }

  get filteredBookings(): Booking[] {
    let result = this.bookings;
    
    // Filter by status
    if (this.statusFilter !== 'all') {
      result = result.filter(b => b.status === this.statusFilter);
    }
    
    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(b => 
        b.confirmationCode?.toLowerCase().includes(term) ||
        b.guestInfo?.firstName?.toLowerCase().includes(term) ||
        b.guestInfo?.lastName?.toLowerCase().includes(term) ||
        b.guestInfo?.email?.toLowerCase().includes(term) ||
        b.hotelName?.toLowerCase().includes(term)
      );
    }
    
    return result;
  }

  get bookingStats(): { total: number; confirmed: number; cancelled: number; pending: number } {
    return {
      total: this.bookings.length,
      confirmed: this.bookings.filter(b => b.status === 'CONFIRMED').length,
      cancelled: this.bookings.filter(b => b.status === 'CANCELLED').length,
      pending: this.bookings.filter(b => b.status === 'PENDING').length
    };
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    return booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED';
  }

  // View Details
  viewDetails(booking: Booking): void {
    this.selectedBooking = booking;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedBooking = null;
  }

  // Cancel booking
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

  setStatusFilter(status: string): void {
    this.statusFilter = status;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }
}
