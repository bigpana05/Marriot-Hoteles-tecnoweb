import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { Room, RoomFilterOptions } from '../models/room.model';
import { Booking, CreateBookingDTO, BookingSummary } from '../models/booking.model';

/**
 * Servicio para gestión de reservas de hoteles
 * Maneja habitaciones, tarifas y proceso de reserva
 */
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly API_URL = 'http://localhost:3000';

  // Estado de la reserva en progreso
  private currentBookingSummary = new BehaviorSubject<BookingSummary | null>(null);
  currentBookingSummary$ = this.currentBookingSummary.asObservable();

  // Parámetros de búsqueda actuales
  private searchParams = new BehaviorSubject<{
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children: number;
  } | null>(null);
  searchParams$ = this.searchParams.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Genera un código de confirmación único
   */
  private generateConfirmationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'MRB';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code + new Date().getFullYear();
  }

  /**
   * Obtiene las habitaciones disponibles de un hotel
   * @param hotelId - ID del hotel
   * @returns Observable con lista de habitaciones
   */
  getRoomsByHotelId(hotelId: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.API_URL}/rooms?hotelId=${hotelId}`).pipe(
      catchError(error => {
        console.error('Error al obtener habitaciones:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene una habitación específica por ID
   * @param roomId - ID de la habitación
   * @returns Observable con la habitación
   */
  getRoomById(roomId: number): Observable<Room | null> {
    return this.http.get<Room>(`${this.API_URL}/rooms/${roomId}`).pipe(
      catchError(error => {
        console.error('Error al obtener habitación:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza la disponibilidad de una habitación
   * @param roomId - ID de la habitación
   * @param change - Cambio en la disponibilidad (+1 o -1)
   */
  updateRoomAvailability(roomId: number | string, change: number): Observable<Room | null> {
    return this.getRoomById(Number(roomId)).pipe(
      switchMap(room => {
        if (!room) return of(null);
        const newAvailable = Math.max(0, (room.available || 0) + change);
        return this.http.patch<Room>(`${this.API_URL}/rooms/${roomId}`, {
          available: newAvailable
        });
      }),
      catchError(error => {
        console.error('Error al actualizar disponibilidad:', error);
        return of(null);
      })
    );
  }

  /**
   * Crea una nueva reserva y reduce disponibilidad
   * @param bookingData - Datos de la reserva
   * @returns Observable con la reserva creada
   */
  createBooking(bookingData: CreateBookingDTO): Observable<Booking> {
    const confirmationCode = this.generateConfirmationCode();
    
    const booking: Omit<Booking, 'id'> = {
      ...bookingData,
      confirmationCode,
      userId: bookingData.userId || null,
      guestId: bookingData.guestId || null,
      hotelName: bookingData.hotelName || '',
      roomName: bookingData.roomName || '',
      rateName: bookingData.rateName || '',
      nights: this.calculateNights(bookingData.checkIn, bookingData.checkOut),
      pricePerNight: bookingData.pricePerNight || 0,
      totalPrice: bookingData.totalPrice || 0,
      currency: bookingData.currency || 'EUR',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    // Crear reserva y reducir disponibilidad
    return this.http.post<Booking>(`${this.API_URL}/bookings`, booking).pipe(
      tap((createdBooking) => {
        // Reducir disponibilidad de la habitación
        this.updateRoomAvailability(bookingData.roomId, -bookingData.rooms).subscribe();
        // Limpiar el resumen de reserva después de confirmar
        this.clearBookingSummary();
      })
    );
  }

  /**
   * Cancela una reserva y devuelve el cupo de la habitación
   * @param bookingId - ID de la reserva
   * @returns Observable con la reserva cancelada
   */
  cancelBooking(bookingId: number | string): Observable<Booking | null> {
    return this.getBookingById(bookingId).pipe(
      switchMap(booking => {
        if (!booking) return of(null);
        if (booking.status === 'CANCELLED') return of(booking);

        // Actualizar estado a cancelado
        return this.http.patch<Booking>(`${this.API_URL}/bookings/${bookingId}`, {
          status: 'CANCELLED',
          cancelledAt: new Date().toISOString()
        }).pipe(
          tap(cancelledBooking => {
            // Devolver el cupo de la habitación
            if (cancelledBooking) {
              this.updateRoomAvailability(booking.roomId, booking.rooms).subscribe();
            }
          })
        );
      }),
      catchError(error => {
        console.error('Error al cancelar reserva:', error);
        return of(null);
      })
    );
  }

  /**
   * Verifica si una reserva puede ser cancelada
   * @param booking - Reserva a verificar
   * @returns true si puede cancelarse
   */
  canCancelBooking(booking: Booking): boolean {
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(booking.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    // Cancelable hasta 24 horas antes del check-in
    const diffDays = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 1;
  }

  /**
   * Obtiene una reserva por ID
   * @param bookingId - ID de la reserva
   */
  getBookingById(bookingId: number | string): Observable<Booking | null> {
    return this.http.get<Booking>(`${this.API_URL}/bookings/${bookingId}`).pipe(
      catchError(error => {
        console.error('Error al obtener reserva:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene una reserva por código de confirmación
   * @param code - Código de confirmación
   */
  getBookingByConfirmationCode(code: string): Observable<Booking | null> {
    return this.http.get<Booking[]>(`${this.API_URL}/bookings?confirmationCode=${code}`).pipe(
      map(bookings => bookings.length > 0 ? bookings[0] : null),
      catchError(error => {
        console.error('Error al buscar reserva:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene las reservas de un usuario por su ID
   * @param userId - ID del usuario
   */
  getBookingsByUserId(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.API_URL}/bookings`).pipe(
      map(bookings => bookings.filter(b => b.userId === userId)),
      catchError(error => {
        console.error('Error al obtener reservas del usuario:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene las reservas de un huésped por email
   * @param email - Email del huésped
   */
  getBookingsByEmail(email: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.API_URL}/bookings`).pipe(
      map(bookings => bookings.filter(b => 
        b.guestInfo?.email?.toLowerCase() === email.toLowerCase()
      )),
      catchError(error => {
        console.error('Error al obtener reservas por email:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene todas las reservas (para admin)
   */
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.API_URL}/bookings`).pipe(
      map(bookings => bookings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )),
      catchError(error => {
        console.error('Error al obtener todas las reservas:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene las reservas de un usuario
   * @param userId - ID del usuario (opcional)
   * @returns Observable con lista de reservas
   */
  getBookings(userId?: number): Observable<Booking[]> {
    const url = userId 
      ? `${this.API_URL}/bookings?userId=${userId}` 
      : `${this.API_URL}/bookings`;
    
    return this.http.get<Booking[]>(url).pipe(
      catchError(error => {
        console.error('Error al obtener reservas:', error);
        return of([]);
      })
    );
  }

  /**
   * Establece los parámetros de búsqueda actuales
   * @param params - Parámetros de búsqueda
   */
  setSearchParams(params: {
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children: number;
  }): void {
    this.searchParams.next(params);
  }

  /**
   * Obtiene los parámetros de búsqueda actuales
   */
  getSearchParams(): {
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children: number;
  } | null {
    return this.searchParams.getValue();
  }

  /**
   * Establece el resumen de la reserva en progreso
   * @param summary - Resumen de la reserva
   */
  setBookingSummary(summary: BookingSummary): void {
    this.currentBookingSummary.next(summary);
  }

  /**
   * Obtiene el resumen de la reserva actual
   */
  getBookingSummary(): BookingSummary | null {
    return this.currentBookingSummary.getValue();
  }

  /**
   * Limpia el resumen de la reserva
   */
  clearBookingSummary(): void {
    this.currentBookingSummary.next(null);
  }

  /**
   * Calcula el número de noches entre dos fechas
   * @param checkIn - Fecha de entrada
   * @param checkOut - Fecha de salida
   * @returns Número de noches
   */
  calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }

  /**
   * Calcula el precio total de la estancia
   * @param pricePerNight - Precio por noche
   * @param nights - Número de noches
   * @param rooms - Número de habitaciones
   * @returns Precio total
   */
  calculateTotalPrice(pricePerNight: number, nights: number, rooms: number): number {
    return pricePerNight * nights * rooms;
  }

  /**
   * Obtiene las opciones de filtro para habitaciones
   * @returns Opciones de filtro disponibles
   */
  getRoomFilterOptions(): RoomFilterOptions {
    return {
      roomTypes: [
        { id: 'suite-studio', name: 'Suite Studio', selected: false },
        { id: 'suite', name: 'Suite', selected: false },
        { id: 'deluxe', name: 'Deluxe', selected: false },
        { id: 'standard', name: 'Estándar', selected: false },
        { id: 'premium', name: 'Premium', selected: false }
      ],
      bedTypes: [
        { id: 'king', name: 'King', selected: false },
        { id: 'queen', name: 'Queen', selected: false },
        { id: 'twin', name: 'Twin', selected: false },
        { id: 'double', name: 'Doble', selected: false }
      ],
      views: [
        { id: 'limited', name: 'Vista limitada', selected: false },
        { id: 'city', name: 'Ciudad', selected: false },
        { id: 'sea', name: 'Mar', selected: false },
        { id: 'pool', name: 'Piscina', selected: false },
        { id: 'garden', name: 'Jardín', selected: false }
      ]
    };
  }

  /**
   * Formatea una fecha para mostrar
   * @param dateString - Fecha en formato ISO
   * @returns Fecha formateada (ej: "Mar., 10 mar., 2026")
   */
  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
  }
}
