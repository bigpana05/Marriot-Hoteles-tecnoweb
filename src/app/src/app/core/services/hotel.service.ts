<<<<<<< HEAD
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hotel } from '../models/hotel.model';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private readonly API_URL = 'http://localhost:3000/hotels';

  constructor(private http: HttpClient) {}

  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(this.API_URL);
  }

  createHotel(hotel: Hotel): Observable<Hotel> {
    return this.http.post<Hotel>(this.API_URL, hotel);
  }

  updateHotel(hotel: Hotel): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.API_URL}/${hotel.id}`, hotel);
  }

  deleteHotel(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}

=======
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
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
