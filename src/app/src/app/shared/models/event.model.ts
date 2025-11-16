export interface EventItem {
  id: number;
  hotelId: number;
  name: string;
  date: string; // formato ISO yyyy-mm-dd
  capacity: number;
  price: number; // costo por evento
}
