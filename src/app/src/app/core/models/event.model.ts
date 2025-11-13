export interface Event {
  id?: number;
  name: string;
  hotelId: number;
  location: string;
  date: string; // ISO (YYYY-MM-DD)
  capacity: number;
  attendees: number;
}
