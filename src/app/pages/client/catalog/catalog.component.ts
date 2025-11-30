import { Component, OnInit } from '@angular/core';
import { Hotel } from '../../../src/app/core/models/hotel.model';
import { HotelService } from '../../../src/app/core/services/hotel.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit {
  // todos los hoteles que vienen del backend
  private originalHotels: Hotel[] = [];

  // hoteles divididos en páginas (para las tabs)
  paginatedHotels: Hotel[][] = [];
  pageSize = 10;

  // búsqueda
  searchTerm = '';

  // estados de UI
  loading = false;
  error = '';

  constructor(private hotelService: HotelService) {}

  showBackToTop = false;
  ngOnInit(): void {
    window.addEventListener('scroll', () => {
      this.showBackToTop = window.scrollY > 300; // aparece después de bajar 300px
    });

    this.loading = true;

    this.hotelService.getHotels().subscribe({
      next: (hotels) => {
        this.loading = false;
        this.originalHotels = hotels;
        this.applyFilter(); // crea las pestañas iniciales sin filtro
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar los hoteles.';
      },
    });
  }
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // se llama cada vez que cambia el input de búsqueda
  onSearchChange(): void {
    this.applyFilter();
  }

  // aplica el filtro y vuelve a paginar
  private applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();

    let filtered: Hotel[] = this.originalHotels;

    if (term) {
      filtered = this.originalHotels.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(term) ||
          hotel.city.toLowerCase().includes(term) ||
          hotel.country.toLowerCase().includes(term)
      );
    }

    // volver a construir paginatedHotels en base al filtro
    this.paginatedHotels = [];
    for (let i = 0; i < filtered.length; i += this.pageSize) {
      this.paginatedHotels.push(filtered.slice(i, i + this.pageSize));
    }
  }
}
