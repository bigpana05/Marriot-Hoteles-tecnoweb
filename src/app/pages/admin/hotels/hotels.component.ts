import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HotelService } from '../../../core/services/hotel.service';
import { 
  Hotel, 
  HotelGallery, 
  GalleryCategory,
  Airport, 
  OtherTransport,
  AVAILABLE_AMENITIES,
  HOTEL_BRANDS,
  HOTEL_LANGUAGES,
  CURRENCIES
} from '../../../core/models/hotel.model';

@Component({
  selector: 'app-hotels',
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {
  hotels: Hotel[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Formulario principal
  formModel: Hotel;
  isEditing = false;

  // Secciones del formulario
  activeSection: 'basic' | 'location' | 'amenities' | 'galleries' | 'property' = 'basic';

  // Opciones predefinidas
  brands = HOTEL_BRANDS;
  languages = HOTEL_LANGUAGES;
  currencies = CURRENCIES;
  availableAmenities = AVAILABLE_AMENITIES;

  // Categorías de galería
  galleryCategories: { id: GalleryCategory; name: string }[] = [
    { id: 'property-view', name: 'Vista a la Propiedad' },
    { id: 'suites', name: 'Suites' },
    { id: 'rooms', name: 'Habitaciones' },
    { id: 'gym', name: 'Gimnasio y Entretenimiento' },
    { id: 'entertainment', name: 'Entretenimiento' },
    { id: 'restaurants', name: 'Restaurantes' }
  ];

  // Nuevo aeropuerto
  newAirport: Airport = { name: '', code: '', distance: '', phone: '', hasShuttle: false };
  
  // Nuevo transporte
  newTransport: OtherTransport = { type: '', company: '', phone: '' };

  // Nueva imagen
  newImageUrl = '';

  // Nueva galería
  newGallery: HotelGallery = { category: 'property-view', title: '', imageUrl: '' };

  constructor(private hotelService: HotelService) {
    this.formModel = this.hotelService.createEmptyHotel();
  }

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.loading = true;
    this.hotelService.getHotels().subscribe({
      next: hotels => {
        this.hotels = hotels;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar hoteles';
        this.loading = false;
      }
    });
  }

  setActiveSection(section: 'basic' | 'location' | 'amenities' | 'galleries' | 'property'): void {
    this.activeSection = section;
  }

  edit(h: Hotel): void {
    // Copiar profundamente el hotel
    this.formModel = JSON.parse(JSON.stringify(h));
    
    // Asegurar que las amenidades existan
    if (!this.formModel.amenities || this.formModel.amenities.length === 0) {
      this.formModel.amenities = [...AVAILABLE_AMENITIES];
    } else {
      // Sincronizar con las amenidades disponibles
      const existingIds = this.formModel.amenities.map(a => a.id);
      AVAILABLE_AMENITIES.forEach(amenity => {
        if (!existingIds.includes(amenity.id)) {
          this.formModel.amenities.push({ ...amenity });
        }
      });
    }
    
    this.isEditing = true;
    this.activeSection = 'basic';
    this.error = null;
    this.successMessage = null;
    
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(f?: NgForm): void {
    if (f) f.resetForm();
    this.formModel = this.hotelService.createEmptyHotel();
    this.isEditing = false;
    this.activeSection = 'basic';
    this.error = null;
    this.successMessage = null;
    this.newImageUrl = '';
    this.newAirport = { name: '', code: '', distance: '', phone: '', hasShuttle: false };
    this.newTransport = { type: '', company: '', phone: '' };
    this.newGallery = { category: 'property-view', title: '', imageUrl: '' };
  }

  save(f: NgForm): void {
    if (f.invalid) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }
    
    this.error = null;

    if (this.formModel.id) {
      this.hotelService.updateHotel(this.formModel).subscribe({
        next: () => {
          this.successMessage = 'Hotel actualizado correctamente';
          this.loadHotels();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: () => (this.error = 'Error al actualizar hotel')
      });
    } else {
      this.hotelService.createHotel(this.formModel).subscribe({
        next: () => {
          this.successMessage = 'Hotel creado correctamente';
          this.loadHotels();
          this.resetForm(f);
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: () => (this.error = 'Error al crear hotel')
      });
    }
  }

  delete(h: Hotel): void {
    if (!h.id) return;
    if (!confirm(`¿Eliminar el hotel "${h.name}"?`)) return;
    this.hotelService.deleteHotel(h.id).subscribe({
      next: () => {
        this.successMessage = 'Hotel eliminado correctamente';
        this.loadHotels();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => (this.error = 'Error al eliminar hotel')
    });
  }

  // --- Gestión de imágenes del carrusel ---
  addImage(): void {
    if (this.newImageUrl.trim()) {
      if (!this.formModel.images) this.formModel.images = [];
      this.formModel.images.push(this.newImageUrl.trim());
      this.newImageUrl = '';
    }
  }

  removeImage(index: number): void {
    this.formModel.images.splice(index, 1);
  }

  // --- Gestión de galerías ---
  addGallery(): void {
    if (this.newGallery.title && this.newGallery.imageUrl) {
      if (!this.formModel.galleries) this.formModel.galleries = [];
      this.formModel.galleries.push({ ...this.newGallery });
      this.newGallery = { category: 'property-view', title: '', imageUrl: '' };
    }
  }

  removeGallery(index: number): void {
    this.formModel.galleries.splice(index, 1);
  }

  getGalleryCategoryName(category: GalleryCategory): string {
    return this.galleryCategories.find(c => c.id === category)?.name || category;
  }

  // --- Gestión de aeropuertos ---
  addAirport(): void {
    if (this.newAirport.name && this.newAirport.code) {
      if (!this.formModel.location.nearbyAirports) {
        this.formModel.location.nearbyAirports = [];
      }
      this.formModel.location.nearbyAirports.push({ ...this.newAirport });
      this.newAirport = { name: '', code: '', distance: '', phone: '', hasShuttle: false };
    }
  }

  removeAirport(index: number): void {
    this.formModel.location.nearbyAirports.splice(index, 1);
  }

  // --- Gestión de transportes ---
  addTransport(): void {
    if (this.newTransport.type && this.newTransport.company) {
      if (!this.formModel.location.otherTransports) {
        this.formModel.location.otherTransports = [];
      }
      this.formModel.location.otherTransports.push({ ...this.newTransport });
      this.newTransport = { type: '', company: '', phone: '' };
    }
  }

  removeTransport(index: number): void {
    this.formModel.location.otherTransports.splice(index, 1);
  }

  // --- Toggle amenidad ---
  toggleAmenity(amenityId: string): void {
    const amenity = this.formModel.amenities.find(a => a.id === amenityId);
    if (amenity) {
      amenity.available = !amenity.available;
    }
  }

  // --- Seleccionar marca ---
  selectBrand(brandId: string): void {
    const brand = this.brands.find(b => b.id === brandId);
    if (brand) {
      this.formModel.brand = brand.name;
      this.formModel.brandLogo = brand.logo;
    }
  }

  // --- Obtener estadísticas de comodidades ---
  getActiveAmenitiesCount(): number {
    return this.formModel.amenities?.filter(a => a.available).length || 0;
  }
}
