import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  HotelSearchResult,
  HotelSearchParams,
  SearchFilter,
  SortOption,
  HotelBrand,
  FilterAmenity
} from '../models/hotel-search.model';

/**
 * Servicio para búsqueda de hoteles
 * Maneja la lógica de búsqueda, filtrado y ordenamiento de hoteles
 */
@Injectable({
  providedIn: 'root'
})
export class SearchHotelService {
  // Precio base por noche (1 habitación, 1 huésped)
  private readonly BASE_PRICE_PER_NIGHT = 300;

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
      pricePerNight: 300,
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
          {
            name: 'Treviso Airport',
            code: 'TSF',
            distance: '51,98 km SE',
            phone: '+39 042 2315111',
            hasShuttle: false
          },
          {
            name: 'Venice Marco Polo Airport',
            code: 'VCE',
            distance: '23,01 km S',
            phone: '+39 041 2606111',
            hasShuttle: false
          }
        ],
        otherTransports: [
          {
            type: 'Alquiler de automóvil',
            company: 'Hertz',
            phone: '+39 041 5284091'
          }
        ]
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
    },
    {
      id: 2,
      name: 'W Barcelona',
      brand: 'W Hotels',
      brandLogo: 'assets/brand/hotels/W-Barcelona/wh-logo-white.png',
      language: 'Inglés',
      rating: 4.1,
      reviewCount: 3292,
      distanceFromDestination: 0.2,
      description: 'Sumérgete en la modernidad en el W Barcelona en España',
      pricePerNight: 641,
      currency: 'EUR',
      images: [
        'assets/brand/hotels/W-Barcelona/wh-bcnwh-w-barcelona-23064_Wide-Hor-_1_.png',
        'assets/brand/hotels/W-Barcelona/wh-bcnwh-w-barcelona-23896_Wide-Hor-_1_.png',
        'assets/brand/hotels/W-Barcelona/wh-bcnwh-w-barcelona-27524_Wide-Hor-_1_.png',
        'assets/brand/hotels/W-Barcelona/wh-bcnwh-cool-corner-01--31202-61312_Wide-Hor.png',
        'assets/brand/hotels/W-Barcelona/wh-bcnwh-fabulous-twin-02-41661_Wide-Hor.png'
      ],
      location: {
        address: 'Plaça Rosa dels Vents, 1, Final Passeig de Joan de Borbó',
        city: 'Barcelona',
        country: 'España',
        postalCode: '08039',
        phone: '+3 493-295-2800',
        latitude: 41.3684,
        longitude: 2.1896,
        nearbyAirports: [
          {
            name: 'Girona-Costa Brava Airport',
            code: 'GRO',
            distance: '165,76 km NE',
            phone: '+3 491-321-1000',
            hasShuttle: false
          },
          {
            name: 'Barcelona-El Prat Airport',
            code: 'BCN',
            distance: '28,97 km SW',
            phone: '',
            hasShuttle: false
          }
        ],
        otherTransports: [
          {
            type: 'Alquiler de automóvil',
            company: 'Hertz',
            phone: '+3493356113'
          },
          {
            type: 'Alquiler de automóvil',
            company: 'Sixt',
            phone: '+3 434-932-9251'
          }
        ]
      },
      propertyInfo: {
        checkInTime: '15:00',
        checkOutTime: '12:00',
        smokeFree: true,
        petPolicy: 'Cargo no reembolsable: 100 Por estancia. Póngase en contacto con el hotel para obtener más detalles.',
        accessibilityLink: '#'
      },
      amenities: [
        { id: 'wifi', name: 'Internet de alta velocidad gratis', icon: 'wifi', available: true },
        { id: 'pool', name: 'Piscina', icon: 'pool', available: true },
        { id: 'gym', name: 'Gimnasio', icon: 'gym', available: true },
        { id: 'pets', name: 'Se aceptan mascotas', icon: 'pets', available: true },
        { id: 'parking', name: 'Estacionamiento', icon: 'parking', available: true },
        { id: 'spa', name: 'Spa con servicio completo', icon: 'spa', available: true },
        { id: 'events', name: 'Espacio para eventos y reuniones', icon: 'events', available: true },
        { id: 'atm', name: 'Cajero automático/ATM', icon: 'atm', available: true },
        { id: 'accessible', name: 'Habitación con instalaciones para personas con necesidades especiales', icon: 'accessible', available: true }
      ],
      galleries: [
        { title: 'Vista Al Propiedad', imageUrl: 'assets/brand/hotels/W-Barcelona/wh-bcnwh-w-barcelona-23064_Wide-Hor-_1_.png' },
        { title: 'Suites', imageUrl: 'assets/brand/hotels/W-Barcelona/wh-bcnwh-wow-suite-03--37868-01542_Wide-Hor.png' },
        { title: 'Habitaciones', imageUrl: 'assets/brand/hotels/W-Barcelona/wh-bcnwh-wonderful-sky-twin3-29561-33716_Wide-Hor.png' },
        { title: 'Gimnasio Y Entretenimiento', imageUrl: 'assets/brand/hotels/W-Barcelona/bcnwh-wet-9829-hor-wide.png' },
        { title: 'Restaurantes', imageUrl: 'assets/brand/hotels/W-Barcelona/wh-bcnwh-whobcnwhrf-657586_Wide-Hor.png' }
      ]
    },
    {
      id: 3,
      name: 'Le Royal Méridien Place Vendôme Lusail',
      brand: 'Le Méridien',
      brandLogo: 'assets/brand/hotels/Le-Royal-Meridien/le-meridien-logo.png',
      language: 'Inglés',
      rating: 4.5,
      reviewCount: 346,
      distanceFromDestination: 0,
      description: 'Hotel de lujo moderno de 5 estrellas en Lusail con un elegante Spa, gastronomía gourmet y espacios creativos para reuniones.',
      pricePerNight: 705,
      currency: 'QAR',
      images: [
        'assets/brand/hotels/Le-Royal-Meridien/md-dohmd-exterior---hotel-48418_Wide-Hor.png',
        'assets/brand/hotels/Le-Royal-Meridien/md-dohmd-dohmd-exterior-33508_Wide-Hor.png',
        'assets/brand/hotels/Le-Royal-Meridien/md-dohmd-king-vend-me-room-20879_Wide-Hor.png',
        'assets/brand/hotels/Le-Royal-Meridien/md-dohmd-explorer-suite-39543_Wide-Hor.png',
        'assets/brand/hotels/Le-Royal-Meridien/md-dohmd-swimming-pool-18286_Wide-Hor.png'
      ],
      location: {
        address: 'Building No. 153, Street No. 347, P.O. Box 4010',
        city: 'Lusail',
        country: 'Catar',
        postalCode: '4010',
        phone: '+9 744-141-6000',
        latitude: 25.4300,
        longitude: 51.4900,
        nearbyAirports: [
          {
            name: 'Hamad International Airport',
            code: 'DOH',
            distance: '47,64 km N',
            phone: '',
            hasShuttle: false
          }
        ],
        otherTransports: [
          {
            type: 'Alquiler de automóvil',
            company: 'Hertz',
            phone: '+9 744-448-9944'
          },
          {
            type: 'Estación de metro',
            company: 'Legtaifiya Metro Station',
            phone: ''
          }
        ]
      },
      propertyInfo: {
        checkInTime: '15:00',
        checkOutTime: '12:00',
        smokeFree: false,
        petPolicy: 'No se admiten mascotas.',
        accessibilityLink: '#'
      },
      amenities: [
        { id: 'wifi', name: 'Internet de alta velocidad gratis', icon: 'wifi', available: true },
        { id: 'pool', name: 'Piscina', icon: 'pool', available: true },
        { id: 'gym', name: 'Gimnasio', icon: 'gym', available: true },
        { id: 'kitchen', name: 'Cocina', icon: 'kitchen', available: true },
        { id: 'parking', name: 'Estacionamiento', icon: 'parking', available: true },
        { id: 'events', name: 'Espacio para eventos y reuniones', icon: 'events', available: true },
        { id: 'accessible', name: 'Habitaciones accesibles para movilidad reducida', icon: 'accessible', available: true },
        { id: 'exchange', name: 'Cambio de divisas', icon: 'exchange', available: true },
        { id: 'storage', name: 'Espacio de almacenamiento', icon: 'storage', available: true }
      ],
      galleries: [
        { title: 'Vista Al Propiedad', imageUrl: 'assets/brand/hotels/Le-Royal-Meridien/md-dohmd-exterior---hotel-48418_Wide-Hor.png' },
        { title: 'Suites', imageUrl: 'assets/brand/hotels/Le-Royal-Meridien/md-dohmd-explorer-suite-39543_Wide-Hor.png' },
        { title: 'Habitaciones', imageUrl: 'assets/brand/hotels/Le-Royal-Meridien/md-dohmd-king-vend-me-room-20879_Wide-Hor.png' },
        { title: 'Gimnasio Y Entretenimiento', imageUrl: 'assets/brand/hotels/Le-Royal-Meridien/md-dohmd-gym-shot-2-41986_Wide-Hor.png' },
        { title: 'Restaurantes', imageUrl: 'assets/brand/hotels/Le-Royal-Meridien/md-dohmd-swimming-pool-18286_Wide-Hor.png' }
      ]
    }
  ];

  // Filtros disponibles (se llenan dinámicamente cuando el usuario selecciona)
  private availableFilters: SearchFilter[] = [];

  // Marcas de hoteles disponibles (solo las que tienen hoteles registrados)
  private availableBrands: HotelBrand[] = [
    // Lujo
    { id: 'jw-marriott', name: 'JW Marriott', logo: 'assets/brand/hotels/JW-Venice/jw-marriott-logo.svg', category: 'luxury', selected: false },
    { id: 'w-hotels', name: 'W Hotels', logo: 'assets/brand/hotels/W-Barcelona/wh-logo-white.png', category: 'luxury', selected: false },
    // Premium
    { id: 'le-meridien', name: 'Le Méridien', logo: 'assets/brand/hotels/Le-Royal-Meridien/le-meridien-logo.png', category: 'premium', selected: false }
  ];

  // Comodidades disponibles para filtrar (basadas en las amenidades de los hoteles)
  private availableAmenities: FilterAmenity[] = [
    { id: 'wifi', name: 'Internet de alta velocidad gratis', icon: 'wifi', count: 3, selected: false },
    { id: 'pool', name: 'Piscina', icon: 'pool', count: 3, selected: false },
    { id: 'gym', name: 'Gimnasio', icon: 'gym', count: 3, selected: false },
    { id: 'breakfast', name: 'Desayuno gratis', icon: 'breakfast', count: 1, selected: false },
    { id: 'pets', name: 'Se aceptan mascotas', icon: 'pets', count: 2, selected: false },
    { id: 'spa', name: 'Spa con servicio completo', icon: 'spa', count: 2, selected: false },
    { id: 'events', name: 'Espacio para eventos y reuniones', icon: 'events', count: 3, selected: false },
    { id: 'accessible', name: 'Habitación con instalaciones para personas con necesidades especiales', icon: 'accessible', count: 3, selected: false },
    { id: 'tea', name: 'Té y café en la habitación', icon: 'tea', count: 1, selected: false },
    { id: 'parking', name: 'Estacionamiento', icon: 'parking', count: 2, selected: false },
    { id: 'atm', name: 'Cajero automático/ATM', icon: 'atm', count: 1, selected: false },
    { id: 'kitchen', name: 'Cocina', icon: 'kitchen', count: 1, selected: false },
    { id: 'exchange', name: 'Cambio de divisas', icon: 'exchange', count: 1, selected: false },
    { id: 'storage', name: 'Espacio de almacenamiento', icon: 'storage', count: 1, selected: false }
  ];

  private filtersSubject = new BehaviorSubject<SearchFilter[]>(this.availableFilters);
  private brandsSubject = new BehaviorSubject<HotelBrand[]>(this.availableBrands);
  private amenitiesSubject = new BehaviorSubject<FilterAmenity[]>(this.availableAmenities);
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
      map(hotels => this.filterByDestination(hotels, params.destination)),
      map(hotels => this.applyFilters(hotels))
    );
  }

  /**
   * Filtra hoteles por destino y calcula la distancia
   * @param hotels - Lista de hoteles
   * @param destination - Destino de búsqueda
   * @returns Hoteles filtrados con distancia actualizada
   */
  private filterByDestination(hotels: HotelSearchResult[], destination: string): HotelSearchResult[] {
    if (!destination) return hotels;

    const searchTerm = destination.toLowerCase();
    
    return hotels
      .filter(hotel => {
        // Buscar por nombre de hotel específico
        if (searchTerm.includes(hotel.name.toLowerCase())) {
          return true;
        }
        // Buscar por ciudad
        if (searchTerm.includes(hotel.location.city.toLowerCase())) {
          return true;
        }
        // Buscar por país
        if (searchTerm.includes(hotel.location.country.toLowerCase())) {
          return true;
        }
        return false;
      })
      .map(hotel => {
        // Calcular distancia según tipo de búsqueda
        let distance = hotel.distanceFromDestination;
        
        // Si busca el hotel específico, distancia es la original (cercana)
        if (searchTerm.includes(hotel.name.toLowerCase())) {
          distance = hotel.distanceFromDestination;
        } 
        // Si busca la ciudad, mostrar distancia desde el centro
        else if (searchTerm.includes(hotel.location.city.toLowerCase())) {
          // Distancia desde el centro de la ciudad
          distance = this.getDistanceFromCityCenter(hotel);
        }
        
        return { ...hotel, distanceFromDestination: distance };
      });
  }

  /**
   * Obtiene la distancia desde el centro de la ciudad
   */
  private getDistanceFromCityCenter(hotel: HotelSearchResult): number {
    // Distancias aproximadas desde el centro de cada ciudad
    const cityDistances: { [key: string]: { [hotelId: number]: number } } = {
      'venecia': { 1: 8.5 },      // JW Venice está a 8.5km del centro de Venecia
      'barcelona': { 2: 2.6 },    // W Barcelona está a 2.6km del centro de Barcelona
      'lusail': { 3: 2.3 }        // Le Royal Méridien está a 2.3km del centro de Lusail
    };
    
    const city = hotel.location.city.toLowerCase();
    return cityDistances[city]?.[hotel.id] || hotel.distanceFromDestination;
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
   * Obtiene las marcas disponibles
   * @returns Observable con las marcas
   */
  getBrands(): Observable<HotelBrand[]> {
    return this.brandsSubject.asObservable();
  }

  /**
   * Actualiza el estado de una marca
   * @param brandId - ID de la marca
   * @param selected - Nuevo estado
   */
  updateBrand(brandId: string, selected: boolean): void {
    const brands = this.brandsSubject.value.map(brand =>
      brand.id === brandId ? { ...brand, selected } : brand
    );
    this.brandsSubject.next(brands);
  }

  /**
   * Selecciona todas las marcas de una categoría
   * @param category - Categoría de marcas
   */
  selectAllBrandsByCategory(category: 'luxury' | 'premium' | 'select' | 'longer-stays'): void {
    const brands = this.brandsSubject.value.map(brand =>
      brand.category === category ? { ...brand, selected: true } : brand
    );
    this.brandsSubject.next(brands);
  }

  /**
   * Obtiene las comodidades disponibles para filtrar
   * @returns Observable con las comodidades
   */
  getAmenities(): Observable<FilterAmenity[]> {
    return this.amenitiesSubject.asObservable();
  }

  /**
   * Actualiza el estado de una comodidad
   * @param amenityId - ID de la comodidad
   * @param selected - Nuevo estado
   */
  updateAmenity(amenityId: string, selected: boolean): void {
    const amenities = this.amenitiesSubject.value.map(amenity =>
      amenity.id === amenityId ? { ...amenity, selected } : amenity
    );
    this.amenitiesSubject.next(amenities);
  }

  /**
   * Limpia todos los filtros (marcas y comodidades)
   */
  clearAllFilters(): void {
    const brands = this.brandsSubject.value.map(b => ({ ...b, selected: false }));
    const amenities = this.amenitiesSubject.value.map(a => ({ ...a, selected: false }));
    const filters = this.filtersSubject.value.map(f => ({ ...f, selected: false }));
    
    this.brandsSubject.next(brands);
    this.amenitiesSubject.next(amenities);
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
    const selectedAmenities = this.amenitiesSubject.value.filter(a => a.selected);
    const selectedBrands = this.brandsSubject.value.filter(b => b.selected);

    // Si no hay filtros seleccionados, devolver todos los hoteles
    if (selectedAmenities.length === 0 && selectedBrands.length === 0) {
      return hotels;
    }

    return hotels.filter(hotel => {
      // Filtrar por amenidades seleccionadas (el hotel debe tener TODAS las amenidades seleccionadas)
      const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every(selectedAmenity => {
        const hotelAmenity = hotel.amenities.find(a => a.id === selectedAmenity.id);
        return hotelAmenity?.available === true;
      });

      // Filtrar por marcas seleccionadas (el hotel debe ser de UNA de las marcas seleccionadas)
      const matchesBrands = selectedBrands.length === 0 || selectedBrands.some(selectedBrand => {
        // Mapear el ID de la marca al nombre de la marca del hotel
        const brandNameMap: { [key: string]: string } = {
          'jw-marriott': 'JW Marriott',
          'w-hotels': 'W Hotels',
          'le-meridien': 'Le Méridien'
        };
        return hotel.brand === brandNameMap[selectedBrand.id];
      });

      return matchesAmenities && matchesBrands;
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
