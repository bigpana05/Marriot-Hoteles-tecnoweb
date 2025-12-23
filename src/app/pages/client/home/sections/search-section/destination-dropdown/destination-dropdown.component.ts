import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-destination-dropdown',
  templateUrl: './destination-dropdown.component.html',
  styleUrls: ['./destination-dropdown.component.scss']
})
export class DestinationDropdownComponent {
  @Input() isOpen: boolean = false;
  @Input() searchQuery: string = '';
  @Output() destinationSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  // Destinos disponibles (ciudades y hoteles)
  trendingDestinations: string[] = [
    'Venecia, Italia',
    'Barcelona, España',
    'Lusail, Catar',
    'JW Marriott Venice Resort & Spa, Venecia, Italia',
    'W Barcelona, Barcelona, España',
    'Le Royal Méridien Place Vendôme Lusail, Lusail, Catar'
  ];

  // Getter para destinos filtrados según búsqueda
  get filteredDestinations(): string[] {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return this.trendingDestinations;
    }
    const query = this.searchQuery.toLowerCase();
    return this.trendingDestinations.filter(dest =>
      dest.toLowerCase().includes(query)
    );
  }

  // Selecciona un destino y cierra el dropdown
  selectDestination(destination: string): void {
    this.destinationSelected.emit(destination);
    this.closeDropdown();
  }

  // Cierra el dropdown
  closeDropdown(): void {
    this.close.emit();
  }
}
