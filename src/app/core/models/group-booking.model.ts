/**
 * Modelo para solicitudes de reservas grupales
 */
export interface GroupBooking {
    id?: number;
    userId?: number | string;
    eventName: string;
    eventType: 'business' | 'social' | 'wedding';
    hotelId: number | string;
    hotelName: string;
    checkIn: string;
    checkOut: string;
    rooms: number;
    attendees: number;
    contactInfo: GroupContactInfo;
    status: GroupBookingStatus;
    discount: number;
    estimatedTotal: number;
    pricePerNight: number;
    adminNotes?: string;
    createdAt: string;
    reviewedAt?: string;
    confirmationCode: string;
}

/**
 * Estados posibles de una solicitud grupal
 */
export type GroupBookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Información de contacto del organizador
 */
export interface GroupContactInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
}

/**
 * DTO para crear una nueva solicitud grupal
 */
export interface CreateGroupBookingDTO {
    eventName: string;
    eventType: 'business' | 'social' | 'wedding';
    hotelId: number | string;
    hotelName: string;
    checkIn: string;
    checkOut: string;
    rooms: number;
    attendees: number;
    contactInfo: GroupContactInfo;
    pricePerNight: number;
}

/**
 * Tipos de eventos disponibles
 */
export const EVENT_TYPES = [
    { id: 'business', name: 'Negocios', icon: 'business' },
    { id: 'social', name: 'Social', icon: 'social' },
    { id: 'wedding', name: 'Boda', icon: 'wedding' }
];

/**
 * Calcula el descuento basado en la cantidad de habitaciones y membresía
 */
export function calculateGroupDiscount(rooms: number, isMember: boolean): number {
    let discount = 0;

    if (rooms >= 50) {
        discount = 20;
    } else if (rooms >= 20) {
        discount = 15;
    } else if (rooms >= 10) {
        discount = 10;
    }

    if (isMember) {
        discount += 5;
    }

    return discount;
}

/**
 * Información de ocupación para un día específico
 */
export interface OccupancyDay {
    date: Date;
    total: number;        // Total habitaciones del hotel
    occupied: number;     // Habitaciones ocupadas
    available: number;    // Habitaciones disponibles
    occupancyPercent: number;  // Porcentaje de ocupación
    bookings: string[];   // IDs de las reservas que ocupan este día
}
