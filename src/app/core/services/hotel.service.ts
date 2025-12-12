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
