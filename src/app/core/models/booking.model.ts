/**
 * Modelo de reserva de hotel
 * Representa una reserva completa con información del huésped y pago
 */
export interface Booking {
  id?: number | string;
  hotelId: number;
  hotelName: string;
  roomId: number;
  roomName: string;
  rateId: string;
  rateName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  guestInfo: GuestInfo;
  paymentInfo: PaymentInfo;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  createdAt: string;
  cancelledAt?: string;
  isMember: boolean;
  memberNumber?: string;
  userId?: string | null;
  guestId?: string | null;
  confirmationCode: string;
}

/**
 * Estados posibles de una reserva
 */
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

/**
 * Información del huésped
 */
export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  memberNumber?: string;
  sendSmsConfirmation: boolean;
  country: string;
  postalCode: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
}

/**
 * Información de pago (simulado)
 */
export interface PaymentInfo {
  method: PaymentMethod;
  cardNumber?: string;
  cardLastFour?: string;
  expiryMonth?: string;
  expiryYear?: string;
  acceptTerms: boolean;
  receivePromotions: boolean;
  shareData: boolean;
}

/**
 * Métodos de pago disponibles
 */
export type PaymentMethod = 'credit-card' | 'click-to-pay';

/**
 * DTO para crear una nueva reserva
 */
export interface CreateBookingDTO {
  hotelId: number;
  roomId: number;
  rateId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  guestInfo: GuestInfo;
  paymentInfo: PaymentInfo;
  isMember: boolean;
  userId?: string | null;
  guestId?: string | null;
  hotelName?: string;
  roomName?: string;
  rateName?: string;
  pricePerNight?: number;
  totalPrice?: number;
  currency?: string;
}

/**
 * Resumen de reserva para mostrar en el sidebar
 */
export interface BookingSummary {
  hotelName: string;
  hotelBrand: string;
  roomName: string;
  roomImage: string;
  rateName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
}
