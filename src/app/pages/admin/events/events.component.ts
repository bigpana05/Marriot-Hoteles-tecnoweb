import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EventService } from '../../../src/app/core/services/event.service';
import { HotelService } from '../../../src/app/core/services/hotel.service';
import { Event } from '../../../src/app/core/models/event.model';
import { Hotel } from '../../../src/app/core/models/hotel.model';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  hotels: Hotel[] = [];
  loading = false;
  error: string | null = null;

  formModel: Event = {
    id: undefined,
    name: '',
    hotelId: 1,
    location: '',
    date: '',
    capacity: 0,
    attendees: 0
  };

  constructor(
    private eventService: EventService,
    private hotelService: HotelService
  ) {}

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
        this.error = 'Error al cargar eventos';
        this.loading = false;
      }
    });
  }

  edit(e: Event): void {
    this.formModel = { ...e };
  }

  resetForm(f: NgForm): void {
    f.resetForm({
      id: undefined,
      name: '',
      hotelId: this.hotels[0]?.id ?? 1,
      location: '',
      date: '',
      capacity: 0,
      attendees: 0
    });
    this.error = null;
  }

  save(f: NgForm): void {
    if (f.invalid) return;
    this.error = null;

    const payload: Event = { ...this.formModel };

    if (payload.id) {
      this.eventService.updateEvent(payload).subscribe({
        next: () => {
          this.loadEvents();
          this.resetForm(f);
        },
        error: () => (this.error = 'Error al actualizar evento')
      });
    } else {
      this.eventService.createEvent(payload).subscribe({
        next: () => {
          this.loadEvents();
          this.resetForm(f);
        },
        error: () => (this.error = 'Error al crear evento')
      });
    }
  }

  delete(e: Event): void {
    if (!e.id) return;
    if (!confirm(`¿Eliminar el evento "${e.name}"?`)) return;
    this.eventService.deleteEvent(e.id).subscribe({
      next: () => this.loadEvents(),
      error: () => (this.error = 'Error al eliminar evento')
    });
  }

  occupancy(e: Event): number {
    if (!e.capacity) return 0;
    return Math.round((e.attendees / e.capacity) * 100);
  }

  /** Devuelve el nombre del hotel asociado al evento (para usar en el template) */
  getHotelName(e: Event): string {
    const hotel = this.hotels.find(h => h.id === e.hotelId);
    if (!hotel) return 'Hotel';
    return `${hotel.name} (${hotel.city})`;
  }
}
