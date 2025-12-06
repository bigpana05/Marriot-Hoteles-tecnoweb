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

  // Destinos trending
  trendingDestinations: string[] = [
    'Punta Cana, República Dominicana',
    'Venecia, Italia',
    'Doha, Qatar',
    'Dubái, Emiratos Árabes Unidos',
    'Mallorca, España',
    'París, Francia',
    'Tokio, Japón',
    'Nueva York, EE. UU.'
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
