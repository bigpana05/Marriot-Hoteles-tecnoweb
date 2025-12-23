import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/core/services/event.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Event, ExperienceReservation } from 'src/app/core/models/event.model';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrls: ['./experiences.component.scss'],
})
export class ExperiencesComponent implements OnInit {
  events: Event[] = [];
  isLoading = true;

  // Modal state
  showModal = false;
  selectedEvent: Event | null = null;
  isLoggedIn = false;
  isSubmitting = false;
  showSuccessMessage = false;

  // Carrusel - índice de imagen por evento
  imageIndexes: Map<number | string, number> = new Map();

  // Datos del formulario de reserva
  reservationData = {
    fullName: '',
    email: '',
    phone: '',
    numberOfPeople: 1,
    comments: ''
  };

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEvents();
    this.checkLoginStatus();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data;
        // Inicializar índices de imagen
        this.events.forEach(event => {
          if (event.id) {
            this.imageIndexes.set(event.id, 0);
          }
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar eventos:', err);
        this.isLoading = false;
      },
    });
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.reservationData.fullName = `${user.firstName || ''} ${user.lastName || ''}`;
        this.reservationData.email = user.email;
        this.reservationData.phone = '';
      }
    }
  }

  getAvailability(event: Event): number {
    return event.capacity - event.attendees;
  }

  // Carrusel methods
  getImageIndex(event: Event): number {
    return this.imageIndexes.get(event.id!) || 0;
  }

  getCurrentImage(event: Event): string {
    if (!event.images || event.images.length === 0) {
      return 'assets/images/default-experience.jpg';
    }
    const index = this.getImageIndex(event);
    return event.images[index];
  }

  prevImage(event: Event): void {
    if (!event.id || !event.images) return;
    const current = this.getImageIndex(event);
    const newIndex = current > 0 ? current - 1 : event.images.length - 1;
    this.imageIndexes.set(event.id, newIndex);
  }

  nextImage(event: Event): void {
    if (!event.id || !event.images) return;
    const current = this.getImageIndex(event);
    const newIndex = current < event.images.length - 1 ? current + 1 : 0;
    this.imageIndexes.set(event.id, newIndex);
  }

  goToImage(event: Event, index: number): void {
    if (event.id) {
      this.imageIndexes.set(event.id, index);
    }
  }

  // Modal methods
  openReservationModal(event: Event): void {
    this.selectedEvent = event;
    this.showModal = true;
    this.checkLoginStatus();
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedEvent = null;
    this.resetForm();
  }

  goToLogin(): void {
    this.closeModal();
    this.router.navigate(['/client/login']);
  }

  getAvailableSlots(): number[] {
    if (!this.selectedEvent) return [1];
    const available = this.getAvailability(this.selectedEvent);
    const max = Math.min(available, 10); // Máximo 10 personas por reserva
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  resetForm(): void {
    const user = this.authService.getCurrentUser();
    this.reservationData = {
      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}` : '',
      email: user?.email || '',
      phone: '',
      numberOfPeople: 1,
      comments: ''
    };
  }

  submitReservation(): void {
    if (!this.selectedEvent || !this.selectedEvent.id) return;

    this.isSubmitting = true;
    const user = this.authService.getCurrentUser();

    const reservation: Omit<ExperienceReservation, 'id'> = {
      eventId: this.selectedEvent.id,
      eventName: this.selectedEvent.name,
      userId: user?.id,
      fullName: this.reservationData.fullName,
      email: this.reservationData.email,
      phone: this.reservationData.phone,
      numberOfPeople: Number(this.reservationData.numberOfPeople), // Asegurar que sea número
      comments: this.reservationData.comments,
      reservationDate: new Date().toISOString(),
      status: 'CONFIRMED'
    };

    this.eventService.reserveExperience(this.selectedEvent.id, reservation).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.showSuccessToast();
        this.loadEvents(); // Recargar para actualizar cupos
      },
      error: (err) => {
        console.error('Error al reservar:', err);
        this.isSubmitting = false;
        alert('Error al procesar la reserva. Por favor, intenta de nuevo.');
      }
    });
  }

  showSuccessToast(): void {
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 4000);
  }
}
