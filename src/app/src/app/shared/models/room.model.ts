export interface Room {
  id: number;
  hotelId: number;
  type: string;      // Ej: Suite, Deluxe
  capacity: number;  // cantidad de personas
  price: number;     // precio por noche
  availability: boolean;
}