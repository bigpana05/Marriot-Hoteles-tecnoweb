import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GroupHotel, AVAILABLE_GROUP_AMENITIES, GroupEquipment, AVAILABLE_GROUP_EQUIPMENT } from '../models/group-hotel.model';
import { GroupBooking, CreateGroupBookingDTO, calculateGroupDiscount } from '../models/group-booking.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class GroupBookingService {
    private groupHotelsUrl = 'http://localhost:3000/groupHotels';
    private groupBookingsUrl = 'http://localhost:3000/groupBookings';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    // ========== HOTELES GRUPALES ==========

    /**
     * Obtiene todos los hoteles grupales
     */
    getGroupHotels(): Observable<GroupHotel[]> {
        return this.http.get<GroupHotel[]>(this.groupHotelsUrl);
    }

    /**
     * Obtiene un hotel grupal por ID
     */
    getGroupHotelById(id: number | string): Observable<GroupHotel | undefined> {
        return this.http.get<GroupHotel>(`${this.groupHotelsUrl}/${id}`);
    }

    /**
     * Crea un nuevo hotel grupal
     */
    createGroupHotel(hotel: GroupHotel): Observable<GroupHotel> {
        return this.http.post<GroupHotel>(this.groupHotelsUrl, hotel);
    }

    /**
     * Actualiza un hotel grupal existente
     */
    updateGroupHotel(hotel: GroupHotel): Observable<GroupHotel> {
        return this.http.put<GroupHotel>(`${this.groupHotelsUrl}/${hotel.id}`, hotel);
    }

    /**
     * Elimina un hotel grupal
     */
    deleteGroupHotel(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.groupHotelsUrl}/${id}`);
    }

    /**
     * Crea un hotel grupal vacío con valores predeterminados
     */
    createEmptyGroupHotel(): GroupHotel {
        return {
            name: '',
            brand: '',
            brandLogo: '',
            address: '',
            city: '',
            country: '',
            rating: 0,
            reviewCount: 0,
            distanceToAirport: '',
            images: [],
            galleries: [],
            overview: '',
            totalRooms: 0,
            eventRooms: 0,
            totalEventSpace: 0,
            largestRoom: 0,
            pricePerNight: 0,
            currency: 'EUR',
            amenities: [...AVAILABLE_GROUP_AMENITIES.map(a => ({ ...a }))],
            equipment: this.createEmptyEquipment(),
            coordinates: undefined
        };
    }

    /**
     * Crea la estructura de equipamiento vacía
     */
    private createEmptyEquipment(): GroupEquipment[] {
        return AVAILABLE_GROUP_EQUIPMENT.map(cat => ({
            category: cat.category as any,
            items: []
        }));
    }

    // ========== SOLICITUDES GRUPALES ==========

    /**
     * Obtiene todas las solicitudes grupales
     */
    getGroupBookings(): Observable<GroupBooking[]> {
        return this.http.get<GroupBooking[]>(this.groupBookingsUrl);
    }

    /**
     * Obtiene las solicitudes grupales de un usuario por email
     */
    getGroupBookingsByEmail(email: string): Observable<GroupBooking[]> {
        return this.http.get<GroupBooking[]>(this.groupBookingsUrl).pipe(
            map(bookings => bookings.filter(b => b.contactInfo.email === email))
        );
    }

    /**
     * Obtiene una solicitud grupal por ID
     */
    getGroupBookingById(id: number): Observable<GroupBooking | undefined> {
        return this.http.get<GroupBooking>(`${this.groupBookingsUrl}/${id}`);
    }

    /**
     * Obtiene una solicitud grupal por código de confirmación
     */
    getGroupBookingByConfirmationCode(code: string): Observable<GroupBooking | undefined> {
        return this.http.get<GroupBooking[]>(`${this.groupBookingsUrl}?confirmationCode=${code}`)
            .pipe(map(bookings => bookings[0]));
    }

    /**
     * Obtiene solo las reservas aprobadas
     */
    getApprovedBookings(): Observable<GroupBooking[]> {
        return this.http.get<GroupBooking[]>(this.groupBookingsUrl).pipe(
            map(bookings => bookings.filter(b => b.status === 'APPROVED'))
        );
    }

    /**
     * Obtiene reservas aprobadas para un hotel específico
     */
    getBookingsForHotel(hotelId: number | string): Observable<GroupBooking[]> {
        return this.http.get<GroupBooking[]>(this.groupBookingsUrl).pipe(
            map(bookings => bookings.filter(b =>
                b.hotelId === hotelId && b.status === 'APPROVED'
            ))
        );
    }

    /**
     * Crea una nueva solicitud grupal
     */
    createGroupBooking(dto: CreateGroupBookingDTO): Observable<GroupBooking> {
        const currentUser = this.authService.getCurrentUser();
        const isMember = !!currentUser;

        const nights = this.calculateNights(dto.checkIn, dto.checkOut);
        const discount = calculateGroupDiscount(dto.rooms, isMember);
        const subtotal = dto.pricePerNight * nights * dto.rooms;
        const estimatedTotal = subtotal - (subtotal * discount / 100);

        const booking: GroupBooking = {
            ...dto,
            userId: currentUser?.id,
            status: 'PENDING',
            discount: discount,
            estimatedTotal: estimatedTotal,
            createdAt: new Date().toISOString(),
            confirmationCode: this.generateConfirmationCode()
        };

        return this.http.post<GroupBooking>(this.groupBookingsUrl, booking);
    }

    /**
     * Actualiza el estado de una solicitud (ADMIN)
     */
    updateGroupBookingStatus(
        id: number,
        status: 'APPROVED' | 'REJECTED',
        adminNotes?: string
    ): Observable<GroupBooking> {
        return this.http.patch<GroupBooking>(`${this.groupBookingsUrl}/${id}`, {
            status,
            adminNotes,
            reviewedAt: new Date().toISOString()
        });
    }

    /**
     * Calcula las noches entre dos fechas
     */
    private calculateNights(checkIn: string, checkOut: string): number {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const diffMs = checkOutDate.getTime() - checkInDate.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    /**
     * Genera un código de confirmación único
     */
    private generateConfirmationCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'GRP';
        for (let i = 0; i < 10; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Formatea una fecha para mostrar
     */
    formatDisplayDate(dateString: string): string {
        let date: Date;
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-').map(Number);
            date = new Date(year, month - 1, day);
        } else {
            date = new Date(dateString);
        }

        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
}
