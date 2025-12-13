/**
 * Modelo para los resultados de búsqueda de hoteles
 * Incluye toda la información necesaria para mostrar en las cards de resultados
 */
export interface HotelSearchResult {
  id: number;
  name: string;
  brand: string;
  brandLogo: string;
  language: string;
  rating: number;
  reviewCount: number;
  distanceFromDestination: number;
  description: string;
  pricePerNight: number;
  currency: string;
  images: string[];
  location: HotelLocation;
  propertyInfo: HotelPropertyInfo;
  amenities: HotelAmenity[];
  galleries: HotelGallery[];
}

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
  nearbyAirports: Airport[];
  otherTransport: string;
}

/**
 * Información de aeropuertos cercanos
 */
export interface Airport {
  name: string;
  code: string;
}

/**
 * Información de la propiedad del hotel
 */
export interface HotelPropertyInfo {
  checkInTime: string;
  checkOutTime: string;
  smokeFree: boolean;
  petPolicy: string;
  accessibilityLink: string;
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
 * Galería de imágenes del hotel
 */
export interface HotelGallery {
  title: string;
  imageUrl: string;
  link?: string;
}

/**
 * Parámetros de búsqueda de hoteles
 */
export interface HotelSearchParams {
  destination: string;
  checkIn: Date;
  checkOut: Date;
  rooms: number;
  adults: number;
  children: number;
}

/**
 * Filtros disponibles para la búsqueda
 */
export interface SearchFilter {
  id: string;
  name: string;
  count: number;
  selected: boolean;
}

/**
 * Opciones de ordenamiento
 */
export type SortOption = 'distance' | 'price-low' | 'price-high' | 'rating';
