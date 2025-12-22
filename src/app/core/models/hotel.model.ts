/**
 * Modelo unificado de Hotel
 * Contiene toda la información necesaria para el admin y la vista de cliente
 */
export interface Hotel {
  id?: number | string;
  
  // Información básica
  name: string;
  brand: string;
  brandLogo: string;
  language: string;
  description: string;
  
  // Valoración
  rating: number;
  reviewCount: number;
  
  // Precios
  basePrice: number;
  currency: string;
  
  // Imágenes del carrusel principal
  images: string[];
  
  // Galerías categorizadas
  galleries: HotelGallery[];
  
  // Ubicación
  location: HotelLocation;
  
  // Información de la propiedad
  propertyInfo: HotelPropertyInfo;
  
  // Comodidades disponibles
  amenities: HotelAmenity[];
  
  // Control de habitaciones (para admin legacy)
  totalRooms: number;
  availableRooms: number;
  
  // Estado
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Galería de imágenes del hotel con categorías
 */
export interface HotelGallery {
  category: GalleryCategory;
  title: string;
  imageUrl: string;
  link?: string;
}

/**
 * Categorías de galerías disponibles
 */
export type GalleryCategory = 
  | 'property-view'    // Vista a la propiedad
  | 'suites'           // Suites
  | 'rooms'            // Habitaciones
  | 'gym'              // Gimnasio y Entretenimiento
  | 'entertainment'    // Entretenimiento
  | 'restaurants';     // Restaurantes

/**
 * Información de ubicación del hotel
 */
export interface HotelLocation {
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  latitude: number;
  longitude: number;
  distanceFromCenter: number;
  nearbyAirports: Airport[];
  otherTransports: OtherTransport[];
}

/**
 * Información de aeropuertos cercanos
 */
export interface Airport {
  name: string;
  code: string;
  distance?: string;
  phone?: string;
  hasShuttle?: boolean;
}

/**
 * Información de otros medios de transporte
 */
export interface OtherTransport {
  type: string;
  company: string;
  phone?: string;
}

/**
 * Información de la propiedad del hotel
 */
export interface HotelPropertyInfo {
  checkInTime: string;
  checkOutTime: string;
  smokeFree: boolean;
  petPolicy: string;
  accessibilityLink?: string;
  yearBuilt?: number;
  yearRenovated?: number;
}

/**
 * Comodidad del hotel
 */
export interface HotelAmenity {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

/**
 * Lista de comodidades predefinidas disponibles
 */
export const AVAILABLE_AMENITIES: HotelAmenity[] = [
  { id: 'wifi', name: 'Internet de alta velocidad gratis', icon: 'wifi', available: false },
  { id: 'pool', name: 'Piscina', icon: 'pool', available: false },
  { id: 'gym', name: 'Gimnasio', icon: 'gym', available: false },
  { id: 'spa', name: 'Spa con servicio completo', icon: 'spa', available: false },
  { id: 'parking', name: 'Estacionamiento', icon: 'parking', available: false },
  { id: 'pets', name: 'Se aceptan mascotas', icon: 'pets', available: false },
  { id: 'restaurant', name: 'Restaurante', icon: 'restaurant', available: false },
  { id: 'bar', name: 'Bar/Lounge', icon: 'bar', available: false },
  { id: 'room-service', name: 'Servicio a la habitación 24h', icon: 'room-service', available: false },
  { id: 'events', name: 'Espacio para eventos y reuniones', icon: 'events', available: false },
  { id: 'business', name: 'Centro de negocios', icon: 'business', available: false },
  { id: 'concierge', name: 'Servicio de conserjería', icon: 'concierge', available: false },
  { id: 'laundry', name: 'Lavandería/Tintorería', icon: 'laundry', available: false },
  { id: 'atm', name: 'Cajero automático/ATM', icon: 'atm', available: false },
  { id: 'exchange', name: 'Cambio de divisas', icon: 'exchange', available: false },
  { id: 'accessible', name: 'Habitaciones accesibles', icon: 'accessible', available: false },
  { id: 'storage', name: 'Consigna de equipaje', icon: 'storage', available: false },
  { id: 'airport-shuttle', name: 'Transporte al aeropuerto', icon: 'airport-shuttle', available: false },
  { id: 'ev-charging', name: 'Cargador para vehículos eléctricos', icon: 'ev-charging', available: false },
  { id: 'kids-club', name: 'Club infantil', icon: 'kids-club', available: false }
];

/**
 * Marcas de hoteles disponibles
 */
export const HOTEL_BRANDS = [
  { id: 'marriott', name: 'Marriott Hotels', logo: 'assets/brand/logos/marriott.svg' },
  { id: 'jw-marriott', name: 'JW Marriott', logo: 'assets/brand/logos/jw-marriott.svg' },
  { id: 'w-hotels', name: 'W Hotels', logo: 'assets/brand/logos/w-hotels.svg' },
  { id: 'le-meridien', name: 'Le Méridien', logo: 'assets/brand/logos/le-meridien.svg' },
  { id: 'sheraton', name: 'Sheraton', logo: 'assets/brand/logos/sheraton.svg' },
  { id: 'westin', name: 'Westin', logo: 'assets/brand/logos/westin.svg' },
  { id: 'ritz-carlton', name: 'The Ritz-Carlton', logo: 'assets/brand/logos/ritz-carlton.svg' },
  { id: 'st-regis', name: 'St. Regis', logo: 'assets/brand/logos/st-regis.svg' },
  { id: 'renaissance', name: 'Renaissance Hotels', logo: 'assets/brand/logos/renaissance.svg' },
  { id: 'courtyard', name: 'Courtyard by Marriott', logo: 'assets/brand/logos/courtyard.svg' }
];

/**
 * Idiomas disponibles para hoteles
 */
export const HOTEL_LANGUAGES = [
  'Español',
  'Inglés',
  'Francés',
  'Alemán',
  'Italiano',
  'Portugués',
  'Chino',
  'Japonés',
  'Árabe'
];

/**
 * Monedas disponibles
 */
export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dólar estadounidense' },
  { code: 'GBP', symbol: '£', name: 'Libra esterlina' },
  { code: 'CLP', symbol: '$', name: 'Peso chileno' },
  { code: 'ARS', symbol: '$', name: 'Peso argentino' },
  { code: 'MXN', symbol: '$', name: 'Peso mexicano' },
  { code: 'BRL', symbol: 'R$', name: 'Real brasileño' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Rial catarí' }
];
