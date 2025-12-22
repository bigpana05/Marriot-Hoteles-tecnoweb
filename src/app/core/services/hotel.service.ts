import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Hotel, HotelAmenity, AVAILABLE_AMENITIES } from '../models/hotel.model';
import { HotelSearchResult } from '../models/hotel-search.model';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private readonly API_URL = 'http://localhost:3000/hotels';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los hoteles
   */
  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(this.API_URL).pipe(
      catchError(error => {
        console.error('Error al cargar hoteles:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene solo los hoteles activos
   */
  getActiveHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.API_URL}?isActive=true`).pipe(
      catchError(error => {
        console.error('Error al cargar hoteles activos:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un hotel por su ID
   */
  getHotelById(id: number | string): Observable<Hotel | null> {
    return this.http.get<Hotel>(`${this.API_URL}/${id}`).pipe(
      catchError(error => {
        console.error('Error al cargar hotel:', error);
        return of(null);
      })
    );
  }

  /**
   * Convierte un Hotel a HotelSearchResult para compatibilidad con la vista de cliente
   */
  hotelToSearchResult(hotel: Hotel): HotelSearchResult {
    return {
      id: typeof hotel.id === 'string' ? parseInt(hotel.id, 10) : hotel.id!,
      name: hotel.name,
      brand: hotel.brand,
      brandLogo: hotel.brandLogo,
      language: hotel.language,
      rating: hotel.rating,
      reviewCount: hotel.reviewCount,
      distanceFromDestination: hotel.location?.distanceFromCenter || 0,
      description: hotel.description,
      pricePerNight: hotel.basePrice,
      currency: hotel.currency,
      images: hotel.images,
      location: {
        address: hotel.location?.address || '',
        city: hotel.location?.city || '',
        country: hotel.location?.country || '',
        postalCode: hotel.location?.postalCode || '',
        phone: hotel.location?.phone || '',
        latitude: hotel.location?.latitude || 0,
        longitude: hotel.location?.longitude || 0,
        nearbyAirports: hotel.location?.nearbyAirports || [],
        otherTransports: hotel.location?.otherTransports || []
      },
      propertyInfo: {
        checkInTime: hotel.propertyInfo?.checkInTime || '15:00',
        checkOutTime: hotel.propertyInfo?.checkOutTime || '12:00',
        smokeFree: hotel.propertyInfo?.smokeFree || false,
        petPolicy: hotel.propertyInfo?.petPolicy || '',
        accessibilityLink: hotel.propertyInfo?.accessibilityLink || '#'
      },
      amenities: hotel.amenities?.filter(a => a.available) || [],
      galleries: hotel.galleries?.map(g => ({
        title: g.title,
        imageUrl: g.imageUrl,
        link: g.link
      })) || []
    };
  }

  /**
   * Busca hoteles por ciudad/país/destino
   */
  searchHotels(destination: string): Observable<HotelSearchResult[]> {
    const searchTerm = destination.toLowerCase();
    return this.getActiveHotels().pipe(
      map(hotels => {
        const filtered = hotels.filter(h => 
          h.location?.city?.toLowerCase().includes(searchTerm) ||
          h.location?.country?.toLowerCase().includes(searchTerm) ||
          h.name.toLowerCase().includes(searchTerm)
        );
        return filtered.map(h => this.hotelToSearchResult(h));
      })
    );
  }

  /**
   * Crea un nuevo hotel
   */
  createHotel(hotel: Hotel): Observable<Hotel> {
    const newHotel = {
      ...hotel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.http.post<Hotel>(this.API_URL, newHotel);
  }

  /**
   * Actualiza un hotel existente
   */
  updateHotel(hotel: Hotel): Observable<Hotel> {
    const updatedHotel = {
      ...hotel,
      updatedAt: new Date().toISOString()
    };
    return this.http.put<Hotel>(`${this.API_URL}/${hotel.id}`, updatedHotel);
  }

  /**
   * Elimina un hotel
   */
  deleteHotel(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtiene la lista de comodidades disponibles
   */
  getAvailableAmenities(): HotelAmenity[] {
    return [...AVAILABLE_AMENITIES];
  }

  /**
   * Crea un hotel vacío con valores por defecto
   */
  createEmptyHotel(): Hotel {
    return {
      name: '',
      brand: '',
      brandLogo: '',
      language: 'Español',
      description: '',
      rating: 0,
      reviewCount: 0,
      basePrice: 0,
      currency: 'EUR',
      images: [],
      galleries: [],
      location: {
        address: '',
        city: '',
        country: '',
        postalCode: '',
        phone: '',
        latitude: 0,
        longitude: 0,
        distanceFromCenter: 0,
        nearbyAirports: [],
        otherTransports: []
      },
      propertyInfo: {
        checkInTime: '15:00',
        checkOutTime: '12:00',
        smokeFree: true,
        petPolicy: '',
        accessibilityLink: '#'
      },
      amenities: this.getAvailableAmenities(),
      totalRooms: 0,
      availableRooms: 0,
      isActive: true
    };
  }
}
