export interface ReservationItemDTO {
  kind: 'room' | 'event';
  refId: number;   // ID de la habitación o evento
  name: string;
  qty: number;
  price: number;
}

export interface Reservation {
  id: number;
  userId: number;
  items: ReservationItemDTO[];
  status: 'PENDING' | 'PAID';
  total: number;
}