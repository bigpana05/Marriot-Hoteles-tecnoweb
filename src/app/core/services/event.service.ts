import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly API_URL = 'http://localhost:3000/events';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.API_URL);
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
}
