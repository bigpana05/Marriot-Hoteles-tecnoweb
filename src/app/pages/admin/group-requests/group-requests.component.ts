import { Component, OnInit } from '@angular/core';
import { GroupBookingService } from '../../../core/services/group-booking.service';
import { GroupBooking } from '../../../core/models/group-booking.model';

@Component({
  selector: 'app-group-requests',
  templateUrl: './group-requests.component.html',
  styleUrls: ['./group-requests.component.scss']
})
export class GroupRequestsComponent implements OnInit {
  requests: GroupBooking[] = [];
  filteredRequests: GroupBooking[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Filtros
  filterStatus: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'ALL';

  // Detalles de solicitud seleccionada
  selectedRequest: GroupBooking | null = null;
  showDetails = false;
  adminNotes = '';

  constructor(private groupService: GroupBookingService) { }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.groupService.getGroupBookings().subscribe({
      next: requests => {
        this.requests = requests.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar solicitudes';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.filterStatus === 'ALL') {
      this.filteredRequests = [...this.requests];
    } else {
      this.filteredRequests = this.requests.filter(r => r.status === this.filterStatus);
    }
  }

  setFilter(status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'): void {
    this.filterStatus = status;
    this.applyFilter();
  }

  viewDetails(request: GroupBooking): void {
    this.selectedRequest = request;
    this.adminNotes = request.adminNotes || '';
    this.showDetails = true;
  }

  closeDetails(): void {
    this.selectedRequest = null;
    this.showDetails = false;
    this.adminNotes = '';
    this.error = null;
  }

  approveRequest(): void {
    if (!this.selectedRequest || !this.selectedRequest.id) return;

    this.groupService.updateGroupBookingStatus(
      this.selectedRequest.id,
      'APPROVED',
      this.adminNotes
    ).subscribe({
      next: () => {
        this.successMessage = 'Solicitud aprobada correctamente';
        this.loadRequests();
        this.closeDetails();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => {
        this.error = 'Error al aprobar solicitud';
      }
    });
  }

  rejectRequest(): void {
    if (!this.selectedRequest || !this.selectedRequest.id) return;
    if (!confirm('¿Está seguro de rechazar esta solicitud?')) return;

    this.groupService.updateGroupBookingStatus(
      this.selectedRequest.id,
      'REJECTED',
      this.adminNotes
    ).subscribe({
      next: () => {
        this.successMessage = 'Solicitud rechazada';
        this.loadRequests();
        this.closeDetails();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => {
        this.error = 'Error al rechazar solicitud';
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'APPROVED': 'Aprobada',
      'REJECTED': 'Rechazada'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return this.groupService.formatDisplayDate(dateString);
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  getPendingCount(): number {
    return this.requests.filter(r => r.status === 'PENDING').length;
  }

  getApprovedCount(): number {
    return this.requests.filter(r => r.status === 'APPROVED').length;
  }

  getRejectedCount(): number {
    return this.requests.filter(r => r.status === 'REJECTED').length;
  }
}
