import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { Event, ExperienceReservation } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly API_URL = 'http://localhost:3000/events';
  private readonly RESERVATIONS_URL = 'http://localhost:3000/experienceReservations';

  constructor(private http: HttpClient) { }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.API_URL);
  }

  getEventById(id: number | string): Observable<Event> {
    return this.http.get<Event>(`${this.API_URL}/${id}`);
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(this.API_URL, event);
  }

  updateEvent(event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.API_URL}/${event.id}`, event);
  }

  deleteEvent(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // Reservar experiencia - incrementa attendees y guarda reserva
  reserveExperience(eventId: number | string, reservation: Omit<ExperienceReservation, 'id'>): Observable<ExperienceReservation> {
    return this.getEventById(eventId).pipe(
      switchMap(event => {
        // Asegurar que attendees y numberOfPeople sean números para evitar concatenación
        const currentAttendees = Number(event.attendees) || 0;
        const newPeople = Number(reservation.numberOfPeople) || 0;

        // Actualizar attendees del evento
        const updatedEvent = {
          ...event,
          attendees: currentAttendees + newPeople
        };

        return this.updateEvent(updatedEvent).pipe(
          switchMap(() => this.http.post<ExperienceReservation>(this.RESERVATIONS_URL, reservation))
        );
      })
    );
  }

  // Obtener reservas de un usuario
  getReservationsByUser(userId: number | string): Observable<ExperienceReservation[]> {
    return this.http.get<ExperienceReservation[]>(`${this.RESERVATIONS_URL}?userId=${userId}`);
  }

  // Obtener todas las reservas
  getAllReservations(): Observable<ExperienceReservation[]> {
    return this.http.get<ExperienceReservation[]>(this.RESERVATIONS_URL);
  }
}
