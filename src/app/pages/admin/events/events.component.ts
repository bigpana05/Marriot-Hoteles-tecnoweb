import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { HotelService } from '../../../core/services/hotel.service';
import { Event, ExperienceReservation } from '../../../core/models/event.model';
import { Hotel } from '../../../core/models/hotel.model';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  hotels: Hotel[] = [];
  reservations: ExperienceReservation[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  activeSection: 'basic' | 'images' | 'reservations' = 'basic';

  formModel: Event = {
    id: undefined,
    name: '',
    hotelId: 1,
    location: '',
    date: '',
    capacity: 100,
    attendees: 0,
    description: '',
    images: ['']
  };

  constructor(
    private eventService: EventService,
    private hotelService: HotelService
  ) { }

  ngOnInit(): void {
    this.hotelService.getHotels().subscribe(h => (this.hotels = h));
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: events => {
        this.events = events;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar experiencias';
        this.loading = false;
      }
    });
  }

  loadReservations(eventId: number | string): void {
    this.eventService.getAllReservations().subscribe({
      next: (res) => {
        this.reservations = res.filter(r => r.eventId == eventId);
      },
      error: () => {
        console.error('Error al cargar reservas');
      }
    });
  }

  edit(e: Event): void {
    this.formModel = {
      ...e,
      images: e.images && e.images.length > 0 ? [...e.images] : ['']
    };
    this.activeSection = 'basic';
    if (e.id) {
      this.loadReservations(e.id);
    }
  }

  resetForm(f: NgForm): void {
    f.resetForm({
      id: undefined,
      name: '',
      hotelId: this.hotels[0]?.id ?? 1,
      location: '',
      date: '',
      capacity: 100,
      attendees: 0,
      description: '',
      images: ['']
    });
    this.formModel.images = [''];
    this.reservations = [];
    this.activeSection = 'basic';
    this.error = null;
    this.successMessage = null;
  }

  save(f: NgForm): void {
    if (f.invalid) return;
    this.error = null;
    this.successMessage = null;

    // Limpiar URLs vacías de imágenes
    const payload: Event = {
      ...this.formModel,
      images: this.formModel.images?.filter(img => img && img.trim() !== '') || []
    };

    if (payload.id) {
      this.eventService.updateEvent(payload).subscribe({
        next: () => {
          this.successMessage = 'Experiencia actualizada correctamente';
          this.loadEvents();
        },
        error: () => (this.error = 'Error al actualizar experiencia')
      });
    } else {
      this.eventService.createEvent(payload).subscribe({
        next: () => {
          this.successMessage = 'Experiencia creada correctamente';
          this.loadEvents();
          this.resetForm(f);
        },
        error: () => (this.error = 'Error al crear experiencia')
      });
    }
  }

  delete(e: Event): void {
    if (!e.id) return;
    if (!confirm(`¿Eliminar la experiencia "${e.name}"?`)) return;
    this.eventService.deleteEvent(e.id).subscribe({
      next: () => {
        this.successMessage = 'Experiencia eliminada';
        this.loadEvents();
      },
      error: () => (this.error = 'Error al eliminar experiencia')
    });
  }

  occupancy(e: Event): number {
    if (!e.capacity) return 0;
    return Math.round((e.attendees / e.capacity) * 100);
  }

  // Manejo de imágenes
  addImage(): void {
    if (!this.formModel.images) {
      this.formModel.images = [];
    }
    if (this.formModel.images.length < 5) {
      this.formModel.images.push('');
    }
  }

  removeImage(index: number): void {
    if (this.formModel.images && this.formModel.images.length > 1) {
      this.formModel.images.splice(index, 1);
    } else if (this.formModel.images) {
      this.formModel.images[0] = '';
    }
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/default-experience.jpg';
  }

  /** Devuelve el nombre del hotel asociado al evento */
  getHotelName(e: Event): string {
    const hotel = this.hotels.find(h => h.id === e.hotelId);
    if (!hotel) return 'Hotel';
    return `${hotel.name} (${hotel.location?.city || ''})`;
  }
}
