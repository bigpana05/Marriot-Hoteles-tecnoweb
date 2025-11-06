import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Hotel } from '../../shared/models/hotel.model';

@Injectable({ providedIn: 'root' })
export class HotelService {
  // En la Etapa 6 montaremos json-server en este puerto.
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getHotels(term = ''): Observable<Hotel[]> {
    const params = term ? new HttpParams().set('q', term) : undefined;
    return this.http
      .get<Hotel[]>(`${this.baseUrl}/hotels`, { params })
      .pipe(catchError(() => throwError(() => new Error('No se pudo cargar hoteles'))));
  }
}
