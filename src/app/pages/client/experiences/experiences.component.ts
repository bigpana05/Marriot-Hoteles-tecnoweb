import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/core/services/event.service';
import { Event } from 'src/app/core/models/event.model';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrls: ['./experiences.component.scss'],
})
export class ExperiencesComponent implements OnInit {
  events: Event[] = [];

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data;
        console.log('Eventos cargados:', this.events);
      },
      error: (err) => {
        console.error('Error al cargar eventos:', err);
      },
    });
  }

  // Método auxiliar para calcular cupos disponibles
  getAvailability(event: Event): number {
    return event.capacity - event.attendees;
  }
}
