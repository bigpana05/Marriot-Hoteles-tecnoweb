import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { Room, RoomFilterOptions } from '../models/room.model';
import { Booking, CreateBookingDTO, BookingSummary } from '../models/booking.model';
import { Hotel } from '../models/hotel.model';

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

  constructor(private http: HttpClient) { }

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
  getRoomById(roomId: number | string): Observable<Room | null> {
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

    // Crear reserva
    return this.http.post<Booking>(`${this.API_URL}/bookings`, booking).pipe(
      tap((createdBooking) => {
        // Limpiar el resumen de reserva después de confirmar
        this.clearBookingSummary();
      })
    );
  }

  /**
   * Cancela una reserva
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
        });
      }),
      catchError(error => {
        console.error('Error al cancelar reserva:', error);
        return of(null);
      })
    );
  }

  /**
   * Verifica la disponibilidad de una habitación específica para un rango de fechas
   * @param hotelId - ID del hotel (ya no se usa, mantenido por compatibilidad)
   * @param roomId - ID del tipo de habitación específico
   * @param checkIn - Fecha de entrada (YYYY-MM-DD)
   * @param checkOut - Fecha de salida (YYYY-MM-DD)
   * @param roomsNeeded - Número de habitaciones necesarias
   * @returns Observable<boolean> - true si hay disponibilidad
   */
  checkAvailability(hotelId: number, roomId: number | string, checkIn: string, checkOut: string, roomsNeeded: number): Observable<boolean> {
    return forkJoin({
      // 1. Obtenemos la habitación específica para saber su inventario (room.available)
      room: this.http.get<Room>(`${this.API_URL}/rooms/${roomId}`),
      // 2. Obtenemos las reservas confirmadas para ESTE tipo de habitación específico
      bookings: this.http.get<Booking[]>(`${this.API_URL}/bookings?roomId=${roomId}&status=CONFIRMED`)
    }).pipe(
      map(({ room, bookings }) => {
        if (!room) return false;

        // Inventario total de este tipo de habitación
        const roomCapacity = room.available || 0;

        // Si no hay inventario configurado, no hay disponibilidad
        if (roomCapacity <= 0) return false;

        // Parsear fecha inicio solicitud
        let reqStart: Date;
        if (checkIn.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [y, m, d] = checkIn.split('-').map(Number);
          reqStart = new Date(y, m - 1, d);
        } else {
          reqStart = new Date(checkIn);
        }

        // Parsear fecha fin solicitud
        let reqEnd: Date;
        if (checkOut.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [y, m, d] = checkOut.split('-').map(Number);
          reqEnd = new Date(y, m - 1, d);
        } else {
          reqEnd = new Date(checkOut);
        }

        // Normalizar a medianoche
        reqStart.setHours(0, 0, 0, 0);
        reqEnd.setHours(0, 0, 0, 0);

        let maxOccupancy = 0;

        // Iterar por cada día de la estancia (excepto el día de salida)
        for (let d = new Date(reqStart); d < reqEnd; d.setDate(d.getDate() + 1)) {
          const currentDate = new Date(d);

          // Filtrar reservas de ESTA habitación que ocupan este día específico
          const activeBookings = bookings.filter(b => {
            let bStart: Date, bEnd: Date;

            // Parsear checkIn de la reserva
            if (b.checkIn.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const [y, m, dd] = b.checkIn.split('-').map(Number);
              bStart = new Date(y, m - 1, dd);
            } else {
              bStart = new Date(b.checkIn);
            }

            // Parsear checkOut de la reserva
            if (b.checkOut.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const [y, m, dd] = b.checkOut.split('-').map(Number);
              bEnd = new Date(y, m - 1, dd);
            } else {
              bEnd = new Date(b.checkOut);
            }

            bStart.setHours(0, 0, 0, 0);
            bEnd.setHours(0, 0, 0, 0);

            // Lógica de ocupación: [Start, End) - el día de salida ya está libre
            return currentDate >= bStart && currentDate < bEnd;
          });

          // Sumar habitaciones ocupadas de ESTE TIPO en este día
          const occupiedRooms = activeBookings.reduce((sum, b) => sum + (b.rooms || 1), 0);

          if (occupiedRooms > maxOccupancy) {
            maxOccupancy = occupiedRooms;
          }
        }

        // Si (Inventario de la habitación - Ocupación Máxima) es suficiente, hay disponibilidad
        return (roomCapacity - maxOccupancy) >= roomsNeeded;
      }),
      catchError(error => {
        console.error('Error al verificar disponibilidad:', error);
        return of(false);
      })
    );
  }

  /**
   * Obtiene todas las reservas activas (confirmadas) para un hotel
   * @param hotelId - ID del hotel
   */
  getActiveBookings(hotelId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.API_URL}/bookings?hotelId=${hotelId}&status=CONFIRMED`);
  }

  /**
   * Obtiene las reservas activas para una habitación específica
   * @param roomId - ID de la habitación
   */
  getActiveBookingsByRoom(roomId: number | string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.API_URL}/bookings?roomId=${roomId}&status=CONFIRMED`);
  }

  /**
   * Verifica disponibilidad de una habitación para una fecha específica
   * Útil para el calendario
   * @param roomId - ID de la habitación
   * @param date - Fecha a verificar
   * @returns Observable con info de disponibilidad
   */
  checkRoomAvailabilityForDate(roomId: number | string, date: Date): Observable<{ available: boolean; occupiedCount: number; totalCapacity: number }> {
    return forkJoin({
      room: this.http.get<Room>(`${this.API_URL}/rooms/${roomId}`),
      bookings: this.http.get<Booking[]>(`${this.API_URL}/bookings?roomId=${roomId}&status=CONFIRMED`)
    }).pipe(
      map(({ room, bookings }) => {
        if (!room) return { available: false, occupiedCount: 0, totalCapacity: 0 };

        const totalCapacity = room.available || 0;
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        // Contar habitaciones ocupadas en esta fecha
        const occupiedCount = bookings.reduce((sum, b) => {
          let bStart: Date, bEnd: Date;

          if (b.checkIn.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [y, m, d] = b.checkIn.split('-').map(Number);
            bStart = new Date(y, m - 1, d);
          } else {
            bStart = new Date(b.checkIn);
          }

          if (b.checkOut.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [y, m, d] = b.checkOut.split('-').map(Number);
            bEnd = new Date(y, m - 1, d);
          } else {
            bEnd = new Date(b.checkOut);
          }

          bStart.setHours(0, 0, 0, 0);
          bEnd.setHours(0, 0, 0, 0);

          if (targetDate >= bStart && targetDate < bEnd) {
            return sum + (b.rooms || 1);
          }
          return sum;
        }, 0);

        return {
          available: (totalCapacity - occupiedCount) > 0,
          occupiedCount,
          totalCapacity
        };
      }),
      catchError(() => of({ available: false, occupiedCount: 0, totalCapacity: 0 }))
    );
  }

  /**
   * Actualiza la disponibilidad global del hotel
   * @param hotelId - ID del hotel
   * @param change - Cambio en la disponibilidad (+/-)
   */
  updateHotelAvailability(hotelId: number, change: number): Observable<any> {
    // Primero obtener el hotel actual
    return this.http.get<any>(`${this.API_URL}/hotels/${hotelId}`).pipe(
      switchMap(hotel => {
        if (!hotel) return of(null);

        const currentAvailable = hotel.availableRooms || 0;
        const newAvailable = Math.max(0, currentAvailable + change);

        // Actualizar solo el campo availableRooms
        return this.http.patch(`${this.API_URL}/hotels/${hotelId}`, {
          availableRooms: newAvailable
        });
      }),
      catchError(error => {
        console.error('Error al actualizar disponibilidad del hotel:', error);
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
    let date: Date;
    // Si es formato YYYY-MM-DD, parsear manualmente como local
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
  }
  /**
   * Crea una nueva habitación
   * @param room - Datos de la habitación
   */
  createRoom(room: Room): Observable<Room> {
    return this.http.post<Room>(`${this.API_URL}/rooms`, room).pipe(
      catchError(error => {
        console.error('Error al crear habitación:', error);
        throw error;
      })
    );
  }

  /**
   * Actualiza una habitación existente
   * @param room - Datos de la habitación con ID
   */
  updateRoom(room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.API_URL}/rooms/${room.id}`, room).pipe(
      catchError(error => {
        console.error('Error al actualizar habitación:', error);
        throw error;
      })
    );
  }

  /**
   * Elimina una habitación por ID
   * @param id - ID de la habitación
   */
  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/rooms/${id}`).pipe(
      catchError(error => {
        console.error('Error al eliminar habitación:', error);
        throw error;
      })
    );
  }

  /**
   * Calcula el número total de habitaciones disponibles de un hotel para una fecha específica
   * Suma la disponibilidad de todos los tipos de habitaciones considerando las reservas activas
   * @param hotelId - ID del hotel
   * @param date - Fecha a verificar (por defecto hoy)
   * @returns Observable con el número de habitaciones disponibles
   */
  getAvailableRoomsForHotelOnDate(hotelId: number, date?: Date): Observable<number> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    return forkJoin({
      // Obtener todas las habitaciones del hotel
      rooms: this.getRoomsByHotelId(hotelId),
      // Obtener todas las reservas confirmadas del hotel
      bookings: this.http.get<Booking[]>(`${this.API_URL}/bookings?hotelId=${hotelId}&status=CONFIRMED`)
    }).pipe(
      map(({ rooms, bookings }) => {
        let totalAvailable = 0;

        // Para cada tipo de habitación del hotel
        rooms.forEach(room => {
          const roomCapacity = room.available || 0;

          // Filtrar reservas de ESTA habitación que ocupan la fecha objetivo
          const occupiedCount = bookings
            .filter(b => {
              // Solo considerar reservas de este tipo de habitación
              if (b.roomId !== room.id) return false;

              let bStart: Date, bEnd: Date;

              // Parsear checkIn de la reserva
              if (b.checkIn.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [y, m, d] = b.checkIn.split('-').map(Number);
                bStart = new Date(y, m - 1, d);
              } else {
                bStart = new Date(b.checkIn);
              }

              // Parsear checkOut de la reserva
              if (b.checkOut.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [y, m, d] = b.checkOut.split('-').map(Number);
                bEnd = new Date(y, m - 1, d);
              } else {
                bEnd = new Date(b.checkOut);
              }

              bStart.setHours(0, 0, 0, 0);
              bEnd.setHours(0, 0, 0, 0);

              // Lógica de ocupación: [Start, End) - el día de salida ya está libre
              return targetDate >= bStart && targetDate < bEnd;
            })
            .reduce((sum, b) => sum + (b.rooms || 1), 0);

          // Sumar las habitaciones disponibles de este tipo
          const availableOfThisType = Math.max(0, roomCapacity - occupiedCount);
          totalAvailable += availableOfThisType;
        });

        return totalAvailable;
      }),
      catchError(error => {
        console.error('Error al calcular disponibilidad del hotel:', error);
        return of(0);
      })
    );
  }
}
