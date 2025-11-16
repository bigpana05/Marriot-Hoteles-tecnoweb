export interface Hotel {
  id?: number;
  name: string;
  city: string;
  country: string;
  address: string;
  roomTypes: string;
  basePrice: number;
  availableRooms: number;
  totalRooms: number;
}
