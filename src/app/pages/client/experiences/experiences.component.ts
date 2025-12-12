import { Component, HostListener, OnInit } from '@angular/core';
import { Event } from '../../../core/models/event.model';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrls: ['./experiences.component.scss'],
})
export class ExperiencesComponent implements OnInit {
  /**
   * Aquí se guardan todos los eventos tal como llegan del backend.
   * No se modifica esta lista, sirve como base para buscar y paginar.
   */
  private originalEvents: Event[] = []; // Renombrado a plural para consistencia

  /**
   * Eventos organizados en grupos de 10 para mostrar en pestañas (paginación).
   * Es un array de arrays: [[eventos_pág_1], [eventos_pág_2], ...]
   */
  paginatedevents: Event[][] = [];
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

  constructor(private eventService: EventService) {}

  /**
   * Cuando inicia el componente:
   * - mostramos “cargando…”
   * - pedimos los eventos
   * - si llega todo bien, armamos las pestañas
   * - si falla, mostramos un mensaje
   */
  ngOnInit(): void {
    this.loading = true;

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.loading = false;
        this.originalEvents = events; // Usamos el nombre plural
        this.applyFilter(); // armamos la vista inicial
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar los eventos.';
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
   * volvemos a filtrar los eventos para mostrar solo los que coinciden.
   */
  onSearchChange(): void {
    this.applyFilter();
  }

  /**
   * Filtramos los eventos y los volvemos a organizar en pestañas (paginación).
   * - si el buscador está vacío → mostramos todos
   * - si tiene texto → filtramos por nombre, ubicación o fecha
   * - luego partimos la lista en bloques de 10
   */
  private applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();

    let filtered = this.originalEvents; // Usamos el nombre plural

    // Si el usuario escribió algo, filtramos
    if (term) {
      filtered = this.originalEvents.filter(
        // Usamos el nombre plural
        (event) =>
          event.name.toLowerCase().includes(term) ||
          event.location.toLowerCase().includes(term) ||
          event.date.toLowerCase().includes(term)
      );
    }

    // Volvemos a armar las pestañas con los eventos filtrados
    this.paginatedevents = [];
    for (let i = 0; i < filtered.length; i += this.pageSize) {
      this.paginatedevents.push(filtered.slice(i, i + this.pageSize));
    }
  }

  /**
   * Resalta el texto si contiene lo que el usuario escribió en el buscador.
   * Se utiliza en el HTML con [ngStyle].
   */
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
