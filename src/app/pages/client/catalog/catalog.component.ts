import { Component, HostListener, OnInit } from '@angular/core';
import { Hotel } from '../../../src/app/core/models/hotel.model';
import { HotelService } from '../../../src/app/core/services/hotel.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit {
  /**
   * Aquí se guardan todos los hoteles tal como llegan del backend.
   * No se modifica esta lista, sirve como base para buscar y paginar.
   */
  private originalHotels: Hotel[] = [];

  /**
   * Hoteles organizados en grupos de 10 para mostrar en pestañas.
   */
  paginatedHotels: Hotel[][] = [];
  pageSize = 10;

  /**
   * Texto que el usuario escribe en el buscador.
   */
  searchTerm = '';

  /**
   * Variables para mostrar mensajes de carga o error.
   */
  loading = false;
  error = '';

  /**
   * Muestra o esconde el botón para volver arriba.
   */
  showBackToTop = false;

  constructor(private hotelService: HotelService) {}

  /**
   * Cuando inicia el componente:
   * - mostramos “cargando…”
   * - pedimos los hoteles
   * - si llega todo bien, armamos las pestañas
   * - si falla, mostramos un mensaje
   */
  ngOnInit(): void {
    this.loading = true;

    this.hotelService.getHotels().subscribe({
      next: (hotels) => {
        this.loading = false;
        this.originalHotels = hotels;
        this.applyFilter(); // armamos la vista inicial
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar los hoteles.';
      },
    });
  }

  /**
   * Cada vez que el usuario baja la página,
   * revisamos si ya pasó 300px para mostrar el botón “volver arriba”.
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showBackToTop = window.scrollY > 300;
  }

  /**
   * Cuando el usuario hace clic en “volver arriba”, sube suave.
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  /**
   * Cuando el usuario escribe en el buscador,
   * volvemos a filtrar los hoteles para mostrar solo los que coinciden.
   */
  onSearchChange(): void {
    this.applyFilter();
  }

  /**
   * Filtramos los hoteles y los volvemos a organizar en pestañas.
   * Básicamente:
   * - si el buscador está vacío → mostramos todos
   * - si tiene texto → filtramos por nombre, ciudad o país
   * - luego partimos la lista en bloques de 10
   */
  private applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();

    let filtered = this.originalHotels;

    // Si el usuario escribió algo, filtramos
    if (term) {
      filtered = this.originalHotels.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(term) ||
          hotel.city.toLowerCase().includes(term) ||
          hotel.country.toLowerCase().includes(term)
      );
    }

    // Volvemos a armar las pestañas con los hoteles filtrados
    this.paginatedHotels = [];
    for (let i = 0; i < filtered.length; i += this.pageSize) {
      this.paginatedHotels.push(filtered.slice(i, i + this.pageSize));
    }
  }
  // Resalta el texto si contiene lo que el usuario escribió en el buscador
  getHighlightStyle(text: string) {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      return {};
    }

    // si el texto incluye lo buscado, le ponemos fondo amarillo suave
    return text.toLowerCase().includes(term)
      ? { 'background-color': '#fff3cd' }
      : {};
  }
}
