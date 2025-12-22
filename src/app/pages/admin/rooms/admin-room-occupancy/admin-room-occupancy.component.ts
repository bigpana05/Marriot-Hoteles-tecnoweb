import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../../../core/services/booking.service';
import { HotelService } from '../../../../core/services/hotel.service';
import { Hotel } from '../../../../core/models/hotel.model';
import { Room } from '../../../../core/models/room.model';
import { Booking } from '../../../../core/models/booking.model';

interface OccupancyDay {
    date: Date;
    dayNumber: number;
    isCurrentMonth: boolean;
    bookings: Booking[];
    occupiedCount: number;
    isToday: boolean;
}

interface RoomOccupancy {
    room: Room;
    bookings: Booking[];
    occupancyByDate: Map<string, Booking[]>;
}

/**
 * Componente para visualizar la ocupación de habitaciones en el panel de administración
 * Muestra un calendario visual con las reservas de cada habitación
 */
@Component({
    selector: 'app-admin-room-occupancy',
    templateUrl: './admin-room-occupancy.component.html',
    styleUrls: ['./admin-room-occupancy.component.scss']
})
export class AdminRoomOccupancyComponent implements OnInit {
    hotels: Hotel[] = [];
    selectedHotelId: number | null = null;
    rooms: Room[] = [];
    roomOccupancies: RoomOccupancy[] = [];

    // Calendario
    currentMonth: Date = new Date();
    calendarDays: OccupancyDay[] = [];
    weekDays: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    isLoading = false;

    // Modal de detalles de reserva
    selectedBooking: Booking | null = null;
    showBookingModal = false;

    constructor(
        private bookingService: BookingService,
        private hotelService: HotelService
    ) { }

    ngOnInit(): void {
        this.loadHotels();
    }

    loadHotels(): void {
        this.hotelService.getHotels().subscribe(hotels => {
            this.hotels = hotels;
        });
    }

    onHotelSelect(hotelId: number): void {
        this.selectedHotelId = hotelId;
        this.loadRoomsAndBookings();
    }

    loadRoomsAndBookings(): void {
        if (!this.selectedHotelId) return;

        this.isLoading = true;

        // Cargar habitaciones del hotel
        this.bookingService.getRoomsByHotelId(this.selectedHotelId).subscribe(rooms => {
            this.rooms = rooms;
            this.roomOccupancies = [];

            // Para cada habitación, cargar sus reservas
            let completedRequests = 0;

            rooms.forEach(room => {
                this.bookingService.getActiveBookingsByRoom(room.id).subscribe(bookings => {
                    const occupancy: RoomOccupancy = {
                        room,
                        bookings,
                        occupancyByDate: this.buildOccupancyMap(bookings)
                    };
                    this.roomOccupancies.push(occupancy);

                    completedRequests++;
                    if (completedRequests === rooms.length) {
                        this.isLoading = false;
                        this.generateCalendar();
                    }
                });
            });

            if (rooms.length === 0) {
                this.isLoading = false;
            }
        });
    }

    /**
     * Construye un mapa de fechas a reservas para acceso rápido
     */
    private buildOccupancyMap(bookings: Booking[]): Map<string, Booking[]> {
        const map = new Map<string, Booking[]>();

        bookings.forEach(booking => {
            const start = this.parseDate(booking.checkIn);
            const end = this.parseDate(booking.checkOut);

            // Iterar cada día de la reserva (excepto checkout)
            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                const key = this.formatDateKey(d);
                if (!map.has(key)) {
                    map.set(key, []);
                }
                map.get(key)!.push(booking);
            }
        });

        return map;
    }

    private parseDate(dateStr: string): Date {
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d);
        }
        return new Date(dateStr);
    }

    private formatDateKey(date: Date): string {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    /**
     * Genera los días del calendario para el mes actual
     */
    generateCalendar(): void {
        this.calendarDays = [];
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Día de la semana del primer día (Lunes = 0)
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Días del mes anterior
        const prevMonth = new Date(year, month, 0);
        for (let i = startDay - 1; i >= 0; i--) {
            const dayNum = prevMonth.getDate() - i;
            this.calendarDays.push({
                date: new Date(year, month - 1, dayNum),
                dayNumber: dayNum,
                isCurrentMonth: false,
                bookings: [],
                occupiedCount: 0,
                isToday: false
            });
        }

        // Días del mes actual
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);

            this.calendarDays.push({
                date,
                dayNumber: day,
                isCurrentMonth: true,
                bookings: [],
                occupiedCount: 0,
                isToday: date.getTime() === today.getTime()
            });
        }

        // Completar última semana
        const remaining = 7 - (this.calendarDays.length % 7);
        if (remaining < 7) {
            for (let i = 1; i <= remaining; i++) {
                this.calendarDays.push({
                    date: new Date(year, month + 1, i),
                    dayNumber: i,
                    isCurrentMonth: false,
                    bookings: [],
                    occupiedCount: 0,
                    isToday: false
                });
            }
        }
    }

    /**
     * Verifica si una habitación está ocupada en una fecha específica
     */
    isRoomOccupied(roomOccupancy: RoomOccupancy, day: OccupancyDay): boolean {
        const key = this.formatDateKey(day.date);
        return roomOccupancy.occupancyByDate.has(key);
    }

    /**
     * Obtiene las reservas de una habitación para un día específico
     */
    getBookingsForDay(roomOccupancy: RoomOccupancy, day: OccupancyDay): Booking[] {
        const key = this.formatDateKey(day.date);
        return roomOccupancy.occupancyByDate.get(key) || [];
    }

    /**
     * Calcula el porcentaje de ocupación de una habitación para un día
     */
    getOccupancyLevel(roomOccupancy: RoomOccupancy, day: OccupancyDay): 'empty' | 'partial' | 'full' {
        const bookings = this.getBookingsForDay(roomOccupancy, day);
        if (bookings.length === 0) return 'empty';

        const totalOccupied = bookings.reduce((sum, b) => sum + (b.rooms || 1), 0);
        const capacity = roomOccupancy.room.available || 1;

        if (totalOccupied >= capacity) return 'full';
        return 'partial';
    }

    /**
     * Navegación del calendario
     */
    prevMonth(): void {
        this.currentMonth = new Date(
            this.currentMonth.getFullYear(),
            this.currentMonth.getMonth() - 1,
            1
        );
        this.generateCalendar();
    }

    nextMonth(): void {
        this.currentMonth = new Date(
            this.currentMonth.getFullYear(),
            this.currentMonth.getMonth() + 1,
            1
        );
        this.generateCalendar();
    }

    get monthName(): string {
        return this.currentMonth.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
        }).replace(/^\w/, c => c.toUpperCase());
    }

    /**
     * Modal de detalles
     */
    showBookingDetails(booking: Booking): void {
        this.selectedBooking = booking;
        this.showBookingModal = true;
    }

    closeBookingModal(): void {
        this.showBookingModal = false;
        this.selectedBooking = null;
    }

    /**
     * Formatea fecha para mostrar
     */
    formatDisplayDate(dateStr: string): string {
        const date = this.parseDate(dateStr);
        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    }

    /**
     * Cuenta total de reservas activas
     */
    get totalActiveBookings(): number {
        return this.roomOccupancies.reduce((sum, ro) => sum + ro.bookings.length, 0);
    }

    /**
     * Obtiene las semanas del calendario (para iterar en filas)
     */
    get calendarWeeks(): OccupancyDay[][] {
        const weeks: OccupancyDay[][] = [];
        for (let i = 0; i < this.calendarDays.length; i += 7) {
            weeks.push(this.calendarDays.slice(i, i + 7));
        }
        return weeks;
    }
}
