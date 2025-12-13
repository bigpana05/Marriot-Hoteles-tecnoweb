import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  HotelSearchResult,
  HotelSearchParams,
  SearchFilter,
  SortOption
} from '../models/hotel-search.model';

/**
 * Servicio para búsqueda de hoteles
 * Maneja la lógica de búsqueda, filtrado y ordenamiento de hoteles
 */
@Injectable({
  providedIn: 'root'
})
export class SearchHotelService {
  // Datos mock del hotel JW Marriott Venice
  private mockHotels: HotelSearchResult[] = [
    {
      id: 1,
      name: 'JW Marriott Venice Resort & Spa',
      brand: 'JW Marriott',
      brandLogo: 'assets/brand/hotels/JW-Venice/jw-marriott-logo.svg',
      language: 'Inglés',
      rating: 4.4,
      reviewCount: 1222,
      distanceFromDestination: 0,
      description: 'Un resort de lujo de cinco estrellas en una isla privada en Venecia con spa, restaurantes e instalaciones excepcionales.',
      pricePerNight: 334,
      currency: 'EUR',
      images: [
        'assets/brand/hotels/JW-Venice/vcejw-exterior-0181-hor-wide.png',
        'assets/brand/hotels/JW-Venice/vcejw-isola-3097-hor-wide.png',
        'assets/brand/hotels/JW-Venice/jw-vcejw-family-premium-room-36862_Wide-Hor.png',
        'assets/brand/hotels/JW-Venice/jw-vcejw-family-premium-room-40269_Wide-Hor.png',
        'assets/brand/hotels/JW-Venice/vcejw-suite-0144-hor-wide.png'
      ],
      location: {
        address: 'Isola delle Rose, Laguna di San Marco',
        city: 'Venecia',
        country: 'Italia',
        postalCode: '30133',
        phone: '+39 041 8521300',
        latitude: 45.405217,
        longitude: 12.360368,
        nearbyAirports: [
          { name: 'Treviso Airport', code: 'TSF' },
          { name: 'Venice Marco Polo Airport', code: 'VCE' }
        ],
        otherTransport: 'Servicio de traslado en bote gratis desde nuestro muelle privado en la Plaza de San Marcos'
      },
      propertyInfo: {
        checkInTime: '15:00',
        checkOutTime: '12:00',
        smokeFree: true,
        petPolicy: 'Comuníquese con el hotel para verificar la disponibilidad. Póngase en contacto con el hotel para obtener más detalles.',
        accessibilityLink: '#'
      },
      amenities: [
        { id: 'wifi', name: 'Internet de alta velocidad gratis', icon: 'wifi', available: true },
        { id: 'pool', name: 'Piscina', icon: 'pool', available: true },
        { id: 'gym', name: 'Gimnasio', icon: 'gym', available: true },
        { id: 'breakfast', name: 'Desayuno gratis', icon: 'breakfast', available: true },
        { id: 'pets', name: 'Se aceptan mascotas', icon: 'pets', available: true },
        { id: 'spa', name: 'Spa con servicio completo', icon: 'spa', available: true },
        { id: 'events', name: 'Espacio para eventos y reuniones', icon: 'events', available: true },
        { id: 'accessible', name: 'Habitación con instalaciones para personas con necesidades especiales', icon: 'accessible', available: true },
        { id: 'tea', name: 'Té y café en la habitación', icon: 'tea', available: true }
      ],
      galleries: [
        { title: 'Vista Al Propiedad', imageUrl: 'assets/brand/hotels/JW-Venice/vcejw-exterior-0181-hor-wide.png' },
        { title: 'Suites', imageUrl: 'assets/brand/hotels/JW-Venice/vcejw-suite-0144-hor-wide.png' },
        { title: 'Habitaciones', imageUrl: 'assets/brand/hotels/JW-Venice/jw-vcejw-family-premium-room-36862_Wide-Hor.png' },
        { title: 'Gimnasio Y Entretenimiento', imageUrl: 'assets/brand/hotels/JW-Venice/jw-vcejw-giorgio-baroni---14-29285-60869_Wide-Hor.png' },
        { title: 'Restaurantes', imageUrl: 'assets/brand/hotels/JW-Venice/jw-vcejw-jw-roseto-entrance-19744-62059_Wide-Hor.png' }
      ]
    }
  ];

  // Filtros disponibles
  private availableFilters: SearchFilter[] = [
    { id: 'breakfast', name: 'Desayuno gratuito', count: 1, selected: false },
    { id: 'pool', name: 'Piscina', count: 1, selected: false },
    { id: 'pets', name: 'Se admiten mascotas', count: 8, selected: false }
  ];

  private filtersSubject = new BehaviorSubject<SearchFilter[]>(this.availableFilters);
  private sortOptionSubject = new BehaviorSubject<SortOption>('distance');

  constructor() {}

  /**
   * Busca hoteles según los parámetros de búsqueda
   * @param params - Parámetros de búsqueda (destino, fechas, habitaciones)
   * @returns Observable con los resultados de la búsqueda
   */
  searchHotels(params: HotelSearchParams): Observable<HotelSearchResult[]> {
    // Simula una llamada HTTP con delay
    return of(this.mockHotels).pipe(
      delay(500),
      map(hotels => this.applyFilters(hotels))
    );
  }

  /**
   * Obtiene los filtros disponibles
   * @returns Observable con los filtros
   */
  getFilters(): Observable<SearchFilter[]> {
    return this.filtersSubject.asObservable();
  }

  /**
   * Actualiza el estado de un filtro
   * @param filterId - ID del filtro a actualizar
   * @param selected - Nuevo estado del filtro
   */
  updateFilter(filterId: string, selected: boolean): void {
    const filters = this.filtersSubject.value.map(filter =>
      filter.id === filterId ? { ...filter, selected } : filter
    );
    this.filtersSubject.next(filters);
  }

  /**
   * Obtiene la opción de ordenamiento actual
   * @returns Observable con la opción de ordenamiento
   */
  getSortOption(): Observable<SortOption> {
    return this.sortOptionSubject.asObservable();
  }

  /**
   * Actualiza la opción de ordenamiento
   * @param option - Nueva opción de ordenamiento
   */
  updateSortOption(option: SortOption): void {
    this.sortOptionSubject.next(option);
  }

  /**
   * Aplica los filtros seleccionados a los resultados
   * @param hotels - Lista de hoteles
   * @returns Lista filtrada de hoteles
   */
  private applyFilters(hotels: HotelSearchResult[]): HotelSearchResult[] {
    const selectedFilters = this.filtersSubject.value.filter(f => f.selected);

    if (selectedFilters.length === 0) {
      return hotels;
    }

    return hotels.filter(hotel => {
      return selectedFilters.every(filter => {
        const amenity = hotel.amenities.find(a => a.id === filter.id);
        return amenity?.available;
      });
    });
  }

  /**
   * Ordena los hoteles según la opción seleccionada
   * @param hotels - Lista de hoteles
   * @param sortOption - Opción de ordenamiento
   * @returns Lista ordenada de hoteles
   */
  sortHotels(hotels: HotelSearchResult[], sortOption: SortOption): HotelSearchResult[] {
    const sorted = [...hotels];

    switch (sortOption) {
      case 'distance':
        return sorted.sort((a, b) => a.distanceFromDestination - b.distanceFromDestination);
      case 'price-low':
        return sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
      case 'price-high':
        return sorted.sort((a, b) => b.pricePerNight - a.pricePerNight);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  }

  /**
   * Obtiene un hotel por su ID
   * @param hotelId - ID del hotel
   * @returns Observable con el hotel encontrado o undefined
   */
  getHotelById(hotelId: number): Observable<HotelSearchResult | undefined> {
    return of(this.mockHotels.find(h => h.id === hotelId)).pipe(delay(200));
  }
}
