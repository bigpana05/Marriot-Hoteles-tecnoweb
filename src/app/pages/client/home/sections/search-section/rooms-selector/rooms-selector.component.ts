import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RoomsData } from '../../../../../../models/rooms-data.model';

@Component({
  selector: 'app-rooms-selector',
  templateUrl: './rooms-selector.component.html',
  styleUrls: ['./rooms-selector.component.scss']
})
export class RoomsSelectorComponent {
  @Input() isOpen: boolean = false;
  @Output() roomsSelected = new EventEmitter<RoomsData>();
  @Output() close = new EventEmitter<void>();

  rooms: number = 1;
  adults: number = 1;
  children: number = 0;

  maxGuestsPerRoom: number = 8;

  // Incrementa el valor de rooms
  incrementRooms(): void {
    this.rooms++;
    this.emitChanges();
  }

  // Decrementa el valor de rooms
  decrementRooms(): void {
    if (this.rooms > 1) {
      this.rooms--;
      this.emitChanges();
    }
  }

  // Incrementa el valor de adults
  incrementAdults(): void {
    if (this.totalGuests < this.maxGuestsPerRoom) {
      this.adults++;
      this.emitChanges();
    }
  }

  // Decrementa el valor de adults
  decrementAdults(): void {
    if (this.adults > 1) {
      this.adults--;
      this.emitChanges();
    }
  }

  // Incrementa el valor de children
  incrementChildren(): void {
    if (this.totalGuests < this.maxGuestsPerRoom) {
      this.children++;
      this.emitChanges();
    }
  }

  // Decrementa el valor de children
  decrementChildren(): void {
    if (this.children > 0) {
      this.children--;
      this.emitChanges();
    }
  }

  // Calcula el total de huéspedes
  get totalGuests(): number {
    return this.adults + this.children;
  }

  // Verifica si se puede incrementar huéspedes
  get canAddGuests(): boolean {
    return this.totalGuests < this.maxGuestsPerRoom;
  }

  // Emite los cambios actuales
  emitChanges(): void {
    this.roomsSelected.emit({
      rooms: this.rooms,
      adults: this.adults,
      children: this.children
    });
  }

  // Resetea los valores
  reset(): void {
    this.rooms = 1;
    this.adults = 1;
    this.children = 0;
    this.emitChanges();
  }

  // Confirma y cierra
  confirmSelection(): void {
    this.emitChanges();
    this.closeDropdown();
  }

  // Cierra el dropdown
  closeDropdown(): void {
    this.close.emit();
  }
}
