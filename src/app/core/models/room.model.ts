/**
 * Modelo de habitación de hotel
 * Representa los tipos de habitaciones disponibles en cada hotel
 */
export interface Room {
  id: number;
  hotelId: number;
  name: string;
  type: RoomType;
  bedType: BedType;
  view: RoomView;
  maxCapacity: number;
  size: string;
  images: string[];
  amenities: RoomAmenities;
  rates: RoomRate[];
  available: number;
}

/**
 * Tipos de habitación disponibles
 */
export type RoomType = 'suite-studio' | 'suite' | 'deluxe' | 'standard' | 'premium';

/**
 * Tipos de cama disponibles
 */
export type BedType = 'king' | 'queen' | 'twin' | 'double';

/**
 * Tipos de vista disponibles
 */
export type RoomView = 'limited' | 'city' | 'sea' | 'pool' | 'garden';

/**
 * Tarifa de habitación
 */
export interface RoomRate {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  currency: string;
  isMemberRate: boolean;
  memberDiscount?: number;
}

/**
 * Amenidades de la habitación organizadas por categoría
 */
export interface RoomAmenities {
  specialBenefits: string[];
  bedsAndLinens: BedsAndLinens;
  roomFeatures: string[];
  bathroomFeatures: string[];
  furnitureAndDecor: string[];
  foodAndBeverages: string[];
  internetAndPhones: InternetAndPhones;
  entertainment: string[];
  accessibility: string[];
  hotelHighlights: string[];
  parkingAndTransport: string[];
  hotelServices: string[];
}

/**
 * Información de camas y ropa de cama
 */
export interface BedsAndLinens {
  maxCapacity: number;
  sofaBed: boolean;
  extraBedsAllowed: boolean;
  cribsAllowed: number;
  maxCribsOrExtraBeds: number;
  beddingDetails: string[];
}

/**
 * Información de internet y teléfonos
 */
export interface InternetAndPhones {
  phones: number;
  phoneFeatures: string[];
  internetAccess: string;
  wifiNote: string;
}

/**
 * Opciones de filtro para habitaciones
 */
export interface RoomFilterOptions {
  roomTypes: { id: RoomType; name: string; selected: boolean }[];
  bedTypes: { id: BedType; name: string; selected: boolean }[];
  views: { id: RoomView; name: string; selected: boolean }[];
}
