import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Hotel } from 'src/app/core/models/hotel.model';
import { BookingService } from 'src/app/core/services/booking.service';

@Component({
    selector: 'app-hotel-card',
    templateUrl: './hotel-card.component.html',
    styleUrls: ['./hotel-card.component.scss']
})
export class HotelCardComponent implements OnInit {
    @Input() hotel!: Hotel;

    // Habitaciones disponibles en tiempo real para hoy
    availableRoomsToday = 0;
    isLoadingAvailability = true;

    constructor(
        private router: Router,
        private bookingService: BookingService
    ) { }

    ngOnInit(): void {
        this.loadRealAvailability();
    }

    // Carga la disponibilidad real del hotel para hoy
    private loadRealAvailability(): void {
        if (!this.hotel?.id) {
            this.isLoadingAvailability = false;
            return;
        }

        const hotelId = typeof this.hotel.id === 'string' ? parseInt(this.hotel.id, 10) : this.hotel.id;
        const today = new Date();

        this.bookingService.getAvailableRoomsForHotelOnDate(hotelId, today)
            .subscribe({
                next: (available) => {
                    this.availableRoomsToday = available;
                    this.isLoadingAvailability = false;
                },
                error: (err) => {
                    console.error('Error al cargar disponibilidad:', err);
                    // En caso de error, usar el valor estático del hotel
                    this.availableRoomsToday = this.hotel?.availableRooms || 0;
                    this.isLoadingAvailability = false;
                }
            });
    }

    // Navega a la página de búsqueda con el hotel preseleccionado
    viewHotelDetails(): void {
        if (this.hotel?.id && this.hotel?.name) {
            // Obtener la fecha actual (hoy) y mañana
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Formatear fechas manualmente (YYYY-MM-DD) respetando la zona horaria local
            const checkIn = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
            const checkOut = `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;

            // Navegar a search-hotels con query params
            this.router.navigate(['/client/search-hotels'], {
                queryParams: {
                    destination: this.hotel.name,
                    checkIn: checkIn,
                    checkOut: checkOut,
                    hotelId: this.hotel.id,
                    rooms: 1,
                    adults: 1,
                    children: 0
                }
            });
        }
    }

    // Obtiene la imagen principal del hotel
    getMainImage(): string {
        if (this.hotel?.images && this.hotel.images.length > 0) {
            return this.hotel.images[0].replace(/\\\\/g, '/');
        }
        return 'assets/brand/hotels/W-Barcelona/wh-bcnwh-w-barcelona-23064_Wide-Hor-_1_.png';
    }

    // Obtiene el logo de la marca
    getBrandLogo(): string {
        if (this.hotel?.brandLogo) {
            return this.hotel.brandLogo.replace(/\\\\/g, '/');
        }
        return '';
    }

    // Genera estrellas basadas en el rating con soporte para media estrella
    getStars(): { type: 'full' | 'half' | 'empty' }[] {
        const rating = this.hotel?.rating || 0;
        const stars: { type: 'full' | 'half' | 'empty' }[] = [];

        // Determinar cuántas estrellas completas
        const fullStars = Math.floor(rating);

        // Determinar si hay media estrella
        const decimal = rating - fullStars;
        const hasHalfStar = decimal >= 0.5;

        // Agregar estrellas completas
        for (let i = 0; i < fullStars; i++) {
            stars.push({ type: 'full' });
        }

        // Agregar media estrella si aplica
        if (hasHalfStar && fullStars < 5) {
            stars.push({ type: 'half' });
        }

        // Rellenar con estrellas vacías hasta tener 5
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push({ type: 'empty' });
        }

        return stars;
    }

    // Verifica si el hotel tiene disponibilidad (basado en disponibilidad real)
    hasAvailability(): boolean {
        return this.availableRoomsToday > 0;
    }

    // Obtiene el número de habitaciones disponibles (real, calculado dinámicamente)
    getAvailableRooms(): number {
        return this.availableRoomsToday;
    }

    // Formatea el precio con el símbolo de moneda
    getFormattedPrice(): string {
        const currency = this.hotel?.currency || 'EUR';
        const symbols: { [key: string]: string } = {
            'EUR': '€',
            'USD': '$',
            'GBP': '£',
            'QAR': 'ر.ق'
        };
        return `${symbols[currency] || currency} ${this.hotel?.basePrice || 0}`;
    }
}
