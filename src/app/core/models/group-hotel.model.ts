/**
 * Modelo para hoteles especializados en grupos y eventos corporativos
 */
export interface GroupHotel {
    id?: number | string;
    name: string;
    brand: string;
    brandLogo: string;
    address: string;
    city: string;
    country: string;
    rating: number;
    reviewCount: number;
    distanceToAirport: string;
    airportCode?: string; // Código IATA del aeropuerto (ej: DXB, JFK, MAD)
    images: string[];
    galleries: GroupHotelGallery[];
    overview: string;
    totalRooms: number;
    eventRooms: number;
    totalEventSpace: number;
    largestRoom: number;
    pricePerNight: number;
    currency: string;
    amenities: GroupAmenity[];
    equipment: GroupEquipment[];
    coordinates?: { lat: number; lng: number };
}

/**
 * Galería de imágenes con etiquetas descriptivas
 */
export interface GroupHotelGallery {
    imageUrl: string;
    label: string;
}

/**
 * Comodidades disponibles en el hotel
 */
export interface GroupAmenity {
    id: string;
    name: string;
    icon: string;
    available: boolean;
}

/**
 * Equipamiento y servicios por categoría
 */
export interface GroupEquipment {
    category: 'business' | 'meeting' | 'services' | 'internet';
    items: string[];
}

/**
 * Comodidades predefinidas disponibles
 */
export const AVAILABLE_GROUP_AMENITIES: GroupAmenity[] = [
    { id: 'wifi', name: 'Wi-Fi gratuito', icon: 'wifi', available: false },
    { id: 'pool', name: 'Piscina', icon: 'pool', available: false },
    { id: 'gym', name: 'Gimnasio', icon: 'gym', available: false },
    { id: 'restaurant', name: 'Restaurante en las instalaciones', icon: 'restaurant', available: false },
    { id: 'parking', name: 'Estacionamiento', icon: 'parking', available: false },
    { id: 'room-service', name: 'Servicio a la habitación', icon: 'room-service', available: false },
    { id: 'airport-shuttle', name: 'Servicio de traslado entre el aeropuerto y el hotel', icon: 'airport-shuttle', available: false },
    { id: 'parking-free', name: 'Estacionamiento gratis', icon: 'parking', available: false },
    { id: 'car-rental', name: 'Oficina de alquiler de automóviles', icon: 'car', available: false },
    { id: 'golf', name: 'Golf', icon: 'golf', available: false },
    { id: 'spa', name: 'Spa con servicio completo', icon: 'spa', available: false },
    { id: 'event-space', name: 'Espacio para eventos y reuniones', icon: 'event', available: false },
    { id: 'meeting-organizer', name: 'Organizador de reuniones certificado', icon: 'organizer', available: false },
    { id: 'resort', name: 'Resort', icon: 'resort', available: false }
];

/**
 * Equipamiento predefinido por categorías
 */
export const AVAILABLE_GROUP_EQUIPMENT: { category: string; label: string; items: string[] }[] = [
    {
        category: 'business',
        label: 'Equipo empresarial',
        items: ['Computadoras']
    },
    {
        category: 'meeting',
        label: 'Equipo para reuniones',
        items: [
            'Equipo AV',
            'Panel con pantalla LCD',
            'Proyector con diapositivas',
            'Micrófono',
            'Dispositivos para encuestas',
            'Escenario'
        ]
    },
    {
        category: 'services',
        label: 'Servicios para reuniones',
        items: [
            'Técnico de AV',
            'Carpintero',
            'Electricista',
            'Guardia de seguridad'
        ]
    },
    {
        category: 'internet',
        label: 'Acceso a Internet de alta velocidad',
        items: [
            'Sala de reuniones, Wireless, Wired'
        ]
    }
];
