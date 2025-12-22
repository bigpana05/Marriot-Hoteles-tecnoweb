import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { GroupBookingService } from '../../../core/services/group-booking.service';
import {
  GroupHotel,
  GroupHotelGallery,
  AVAILABLE_GROUP_AMENITIES,
  AVAILABLE_GROUP_EQUIPMENT,
  GroupEquipment
} from '../../../core/models/group-hotel.model';
import { GroupBooking, OccupancyDay } from '../../../core/models/group-booking.model';

@Component({
  selector: 'app-group-hotels',
  templateUrl: './group-hotels.component.html',
  styleUrls: ['./group-hotels.component.scss']
})
export class GroupHotelsComponent implements OnInit {
  hotels: GroupHotel[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Formulario principal
  formModel: GroupHotel;
  isEditing = false;

  // Secciones del formulario
  activeSection: 'basic' | 'capacity' | 'amenities' | 'equipment' | 'galleries' | 'location' = 'basic';

  // Opciones predefinidas
  equipmentCategories = AVAILABLE_GROUP_EQUIPMENT;

  // Nuevos items para agregar
  newImageUrl = '';
  newGallery: GroupHotelGallery = { imageUrl: '', label: '' };

  // Dashboard de ocupación
  selectedHotelForOccupancy: GroupHotel | null = null;
  approvedBookings: GroupBooking[] = [];
  occupancyDates: OccupancyDay[] = [];
  occupancyStartDate: Date = new Date();
  occupancyEndDate: Date = new Date();

  constructor(private groupService: GroupBookingService) {
    this.formModel = this.groupService.createEmptyGroupHotel();
  }

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.loading = true;
    this.groupService.getGroupHotels().subscribe({
      next: hotels => {
        this.hotels = hotels;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar hoteles grupales';
        this.loading = false;
      }
    });
  }

  setActiveSection(section: 'basic' | 'capacity' | 'amenities' | 'equipment' | 'galleries' | 'location'): void {
    this.activeSection = section;
  }

  edit(hotel: GroupHotel): void {
    this.formModel = JSON.parse(JSON.stringify(hotel));

    // Asegurar que las amenidades existan
    if (!this.formModel.amenities || this.formModel.amenities.length === 0) {
      this.formModel.amenities = [...AVAILABLE_GROUP_AMENITIES.map(a => ({ ...a }))];
    }

    this.isEditing = true;
    this.activeSection = 'basic';
    this.error = null;
    this.successMessage = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(f?: NgForm): void {
    if (f) f.resetForm();
    this.formModel = this.groupService.createEmptyGroupHotel();
    this.isEditing = false;
    this.activeSection = 'basic';
    this.error = null;
    this.successMessage = null;
    this.newImageUrl = '';
    this.newGallery = { imageUrl: '', label: '' };
  }

  save(f: NgForm): void {
    this.error = null;

    if (this.formModel.id) {
      this.groupService.updateGroupHotel(this.formModel).subscribe({
        next: () => {
          this.successMessage = 'Hotel grupal actualizado correctamente';
          this.loadHotels();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: () => (this.error = 'Error al actualizar hotel grupal')
      });
    } else {
      this.groupService.createGroupHotel(this.formModel).subscribe({
        next: () => {
          this.successMessage = 'Hotel grupal creado correctamente';
          this.loadHotels();
          this.resetForm(f);
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: () => (this.error = 'Error al crear hotel grupal')
      });
    }
  }

  delete(hotel: GroupHotel): void {
    if (!hotel.id) return;
    if (!confirm(`¿Eliminar el hotel "${hotel.name}"?`)) return;
    this.groupService.deleteGroupHotel(hotel.id).subscribe({
      next: () => {
        this.successMessage = 'Hotel grupal eliminado correctamente';
        this.loadHotels();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => (this.error = 'Error al eliminar hotel grupal')
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
    if (this.newGallery.imageUrl && this.newGallery.label) {
      if (!this.formModel.galleries) this.formModel.galleries = [];
      this.formModel.galleries.push({ ...this.newGallery });
      this.newGallery = { imageUrl: '', label: '' };
    }
  }

  removeGallery(index: number): void {
    this.formModel.galleries.splice(index, 1);
  }

  // --- Toggle amenidad ---
  toggleAmenity(amenityId: string): void {
    const amenity = this.formModel.amenities.find(a => a.id === amenityId);
    if (amenity) {
      amenity.available = !amenity.available;
    }
  }

  getActiveAmenitiesCount(): number {
    return this.formModel.amenities?.filter(a => a.available).length || 0;
  }

  // --- Gestión de equipamiento ---
  toggleEquipment(category: string, item: string): void {
    const equipment = this.formModel.equipment.find(e => e.category === category);
    if (!equipment) return;

    const index = equipment.items.indexOf(item);
    if (index === -1) {
      equipment.items.push(item);
    } else {
      equipment.items.splice(index, 1);
    }
  }

  isEquipmentActive(category: string, item: string): boolean {
    const equipment = this.formModel.equipment.find(e => e.category === category);
    return equipment ? equipment.items.includes(item) : false;
  }

  getEquipmentCategoryLabel(category: string): string {
    const cat = this.equipmentCategories.find(c => c.category === category);
    return cat ? cat.label : category;
  }

  getEquipmentItems(category: string): string[] {
    const cat = this.equipmentCategories.find(c => c.category === category);
    return cat ? cat.items : [];
  }

  getActiveEquipmentCount(): number {
    return this.formModel.equipment?.reduce((sum, e) => sum + e.items.length, 0) || 0;
  }

  // ========== DASHBOARD DE OCUPACIÓN ==========

  initializeOccupancyDates(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.occupancyStartDate = new Date(today);
    this.occupancyEndDate = new Date(today);
    this.occupancyEndDate.setDate(this.occupancyEndDate.getDate() + 13); // 14 días
  }

  selectHotelForOccupancy(hotel: GroupHotel | null): void {
    this.selectedHotelForOccupancy = hotel;
    if (hotel) {
      this.initializeOccupancyDates();
      this.loadOccupancyData();
    } else {
      this.occupancyDates = [];
    }
  }

  loadOccupancyData(): void {
    if (!this.selectedHotelForOccupancy) return;

    this.groupService.getBookingsForHotel(this.selectedHotelForOccupancy.id!).subscribe({
      next: bookings => {
        this.approvedBookings = bookings;
        this.calculateOccupancy();
      },
      error: () => {
        this.error = 'Error al cargar reservas para ocupación';
      }
    });
  }

  calculateOccupancy(): void {
    if (!this.selectedHotelForOccupancy) return;

    const totalRooms = this.selectedHotelForOccupancy.totalRooms || 0;
    this.occupancyDates = [];

    // Generar días en el rango
    const currentDate = new Date(this.occupancyStartDate);
    while (currentDate <= this.occupancyEndDate) {
      const dayOccupancy = this.getOccupancyForDate(new Date(currentDate), totalRooms);
      this.occupancyDates.push(dayOccupancy);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  getOccupancyForDate(date: Date, totalRooms: number): OccupancyDay {
    let occupied = 0;
    const bookingIds: string[] = [];

    // Buscar reservas que incluyen este día
    for (const booking of this.approvedBookings) {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      // El día está ocupado si checkIn <= date < checkOut
      if (date >= checkIn && date < checkOut) {
        occupied += booking.rooms;
        bookingIds.push(String(booking.id || booking.confirmationCode));
      }
    }

    const available = Math.max(0, totalRooms - occupied);
    const occupancyPercent = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

    return {
      date: new Date(date),
      total: totalRooms,
      occupied,
      available,
      occupancyPercent,
      bookings: bookingIds
    };
  }

  navigateOccupancyPeriod(direction: number): void {
    const days = direction * 14; // Avanzar o retroceder 14 días
    this.occupancyStartDate.setDate(this.occupancyStartDate.getDate() + days);
    this.occupancyEndDate.setDate(this.occupancyEndDate.getDate() + days);
    this.calculateOccupancy();
  }

  formatOccupancyDate(date: Date): string {
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  }
}
