import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hotel } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  // Ajusta el puerto si tu json-server corre en otro (ej. 3000)
  private readonly apiUrl = 'http://localhost:3000/hotels';

  constructor(private http: HttpClient) { }

  /** Obtener todos los hoteles */
  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(this.apiUrl);
  }

  /** Obtener un hotel por ID */
  getHotel(id: number): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.apiUrl}/${id}`);
  }

  /** Crear un nuevo hotel */
  createHotel(hotel: Hotel): Observable<Hotel> {
    return this.http.post<Hotel>(this.apiUrl, hotel);
  }

  /** Actualizar un hotel existente */
  updateHotel(hotel: Hotel): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.apiUrl}/${hotel.id}`, hotel);
  }

  /** Eliminar un hotel */
  deleteHotel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}