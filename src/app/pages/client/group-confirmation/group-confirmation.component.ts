import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupBookingService } from '../../../core/services/group-booking.service';
import { GroupBooking } from '../../../core/models/group-booking.model';

@Component({
  selector: 'app-group-confirmation',
  templateUrl: './group-confirmation.component.html',
  styleUrls: ['./group-confirmation.component.scss']
})
export class GroupConfirmationComponent implements OnInit {
  booking: GroupBooking | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupBookingService
  ) { }

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.loadBooking(code);
    } else {
      this.error = 'Código de confirmación no válido';
    }
  }

  loadBooking(code: string): void {
    this.loading = true;
    this.groupService.getGroupBookingByConfirmationCode(code).subscribe({
      next: booking => {
        this.booking = booking || null;
        if (!this.booking) {
          this.error = 'No se encontró la solicitud';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar la solicitud';
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pendiente de revisión',
      'APPROVED': 'Aprobada',
      'REJECTED': 'Rechazada'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  formatDate(dateString: string): string {
    return this.groupService.formatDisplayDate(dateString);
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  goToHome(): void {
    this.router.navigate(['/client/home']);
  }
}
