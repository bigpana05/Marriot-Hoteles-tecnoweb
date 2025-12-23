export interface Event {
  id?: number | string;
  name: string;
  hotelId: number;
  location: string;
  date: string; // ISO (YYYY-MM-DD)
  capacity: number;
  attendees: number;
  description?: string;
  images?: string[];
  price?: number;
  currency?: string;
}

export interface ExperienceReservation {
  id?: number | string;
  eventId: number | string;
  eventName: string;
  userId?: number | string;
  fullName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  comments?: string;
  reservationDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}
