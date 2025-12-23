import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BookingService } from '../../../../core/services/booking.service';
import { HotelService } from '../../../../core/services/hotel.service';
import { Hotel } from '../../../../core/models/hotel.model';
import { Room, RoomType, BedType, RoomView } from '../../../../core/models/room.model';

/**
 * Componente de administración de habitaciones
 * Permite crear, editar y eliminar habitaciones de hoteles
 */
@Component({
  selector: 'app-admin-rooms',
  templateUrl: './admin-rooms.component.html',
  styleUrls: ['./admin-rooms.component.scss']
})
export class AdminRoomsComponent implements OnInit {
  hotels: Hotel[] = [];
  selectedHotelId: number | null = null;
  rooms: Room[] = [];
  isLoading = false;
  successMessage: string | null = null;
  error: string | null = null;

  // Formulario principal
  formModel: any;
  isEditing = false;
  showForm = false;

  // Secciones del formulario
  activeSection: 'basic' | 'rates' | 'amenities' | 'images' = 'basic';

  // Enums para dropdowns
  roomTypes: { value: RoomType; label: string }[] = [
    { value: 'suite-studio', label: 'Suite Studio' },
    { value: 'suite', label: 'Suite' },
    { value: 'deluxe', label: 'Deluxe' },
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' }
  ];

  bedTypes: { value: BedType; label: string }[] = [
    { value: 'king', label: 'King' },
    { value: 'queen', label: 'Queen' },
    { value: 'twin', label: 'Twin' },
    { value: 'double', label: 'Double' }
  ];

  viewTypes: { value: RoomView; label: string }[] = [
    { value: 'limited', label: 'Vista Limitada' },
    { value: 'city', label: 'Ciudad' },
    { value: 'sea', label: 'Mar' },
    { value: 'pool', label: 'Piscina' },
    { value: 'garden', label: 'Jardín' }
  ];

  // Lista de amenidades disponibles (para selección tipo checkbox)
  availableAmenities = {
    specialBenefits: [
      'WiFi de alta velocidad',
      'Check-in móvil',
      'Acceso a Lounge Ejecutivo',
      'Desayuno incluido',
      'Late check-out'
    ],
    roomFeatures: [
      'Con aire acondicionado',
      'Habitación para no fumadores',
      'Se dispone de habitaciones conectadas (sólo para algunas habitaciones)',
      'Ventanas del piso al techo',
      'Balcón privado',
      'Vista panorámica'
    ],
    bathroomFeatures: [
      'Bañera y ducha por separado',
      'Espejo para maquillaje con iluminación',
      'Secador de cabello',
      'Bata',
      'Pantuflas',
      'Artículos de tocador de lujo',
      'Ducha de lluvia'
    ],
    furnitureAndDecor: [
      'Reloj despertador',
      'Caja de seguridad en la habitación, con cargo',
      'Escritorio, para escribir / trabajar, tomacorriente',
      'Plancha y tabla de planchar',
      'Sofá',
      'Minibar',
      'Área de estar separada'
    ],
    foodAndBeverages: [
      'Servicio en la habitación, las 24 horas',
      'Agua embotellada de cortesía',
      'Servicio de café y té',
      'Agua caliente al instante',
      'Mini-bar, con cargo',
      'Tetera',
      'Cafetera Nespresso'
    ],
    entertainment: [
      'Habitación de alta tecnología con equipos listos para conexión',
      'Cable/satélite',
      'Cable/satélite internacional',
      'Smart TV',
      'Sistema de sonido Bluetooth'
    ],
    accessibility: [
      'Este tipo de habitación no ofrece habitaciones con instalaciones para personas con problemas de movilidad',
      'Este tipo de habitación no ofrece habitaciones con instalaciones para personas con problemas de movilidad con duchas con acceso para sillas de ruedas',
      'Este tipo de habitación no ofrece habitaciones con instalaciones para personas con problemas de audición',
      'Habitación accesible para silla de ruedas',
      'Barras de apoyo en el baño'
    ],
    hotelHighlights: [
      'Este hotel es 100% libre de humo',
      'El hotel se construyó en 2009',
      'Las habitaciones se renovaron en 2018',
      'Arquitectura premiada',
      'Vista al mar'
    ],
    parkingAndTransport: [
      'Estación de carga para vehículos eléctricos gratis',
      'Personal para estacionar gratis',
      'Estacionamiento en el hotel, tarifa: 30,00 EUR por día',
      'Servicio de transporte al aeropuerto'
    ],
    hotelServices: [
      'Gimnasio en las instalaciones',
      'Servicio de apertura de cama',
      'Servicio de lavandería',
      'Servicio de conserjería 24h',
      'Spa y centro de bienestar'
    ]
  };

  // Nueva imagen URL
  newImageUrl = '';

  constructor(
    private bookingService: BookingService,
    private hotelService: HotelService
  ) {
    this.formModel = this.createEmptyRoom();
  }

  ngOnInit(): void {
    this.loadHotels();
  }

  // Carga la lista de hoteles
  loadHotels(): void {
    this.hotelService.getHotels().subscribe(hotels => {
      this.hotels = hotels;
    });
  }

  // Selecciona un hotel y carga sus habitaciones
  onHotelSelect(hotelId: number): void {
    this.selectedHotelId = hotelId;
    this.loadRooms(hotelId);
    this.showForm = false;
  }

  // Carga las habitaciones del hotel seleccionado
  loadRooms(hotelId: number): void {
    this.isLoading = true;
    this.bookingService.getRoomsByHotelId(hotelId).subscribe(rooms => {
      this.rooms = rooms;
      this.isLoading = false;
    });
  }

  // Cambia la sección activa del formulario
  setActiveSection(section: 'basic' | 'rates' | 'amenities' | 'images'): void {
    this.activeSection = section;
  }

  // Crea una habitación vacía con valores por defecto basados en la suite King
  createEmptyRoom(): any {
    return {
      hotelId: this.selectedHotelId || 0,
      name: '',
      type: 'suite-studio',
      bedType: 'king',
      view: 'limited',
      maxCapacity: 2,
      size: '40m²/430ft²',
      images: [],
      available: 5,
      rates: [
        {
          id: 'member-flexible',
          name: 'Tarifa flexible para socios',
          description: 'Tarifa especial para miembros de Marriott Bonvoy',
          pricePerNight: 0,
          currency: 'EUR',
          isMemberRate: true,
          memberDiscount: 15
        },
        {
          id: 'flexible',
          name: 'Tarifa flexible',
          description: 'Cancelación gratuita hasta 2 días antes de la llegada',
          pricePerNight: 0,
          currency: 'EUR',
          isMemberRate: false
        }
      ],
      amenities: {
        specialBenefits: ['WiFi de alta velocidad'],
        bedsAndLinens: {
          maxCapacity: 2,
          sofaBed: false,
          extraBedsAllowed: false,
          cribsAllowed: 0,
          maxCribsOrExtraBeds: 0,
          beddingDetails: ['Colchón con cubierta tipo almohada', 'Colchón de plumas', 'Edredón']
        },
        roomFeatures: ['Con aire acondicionado', 'Habitación para no fumadores'],
        bathroomFeatures: ['Bañera y ducha por separado', 'Secador de cabello', 'Bata', 'Pantuflas'],
        furnitureAndDecor: ['Reloj despertador', 'Caja de seguridad en la habitación, con cargo', 'Escritorio, para escribir / trabajar, tomacorriente'],
        foodAndBeverages: ['Servicio en la habitación, las 24 horas', 'Agua embotellada de cortesía', 'Mini-bar, con cargo'],
        internetAndPhones: {
          phones: 1,
          phoneFeatures: ['Teléfono inalámbrico', 'Correo de voz', 'Teléfono con altavoz'],
          internetAccess: 'Acceso inalámbrico a Internet de cortesía',
          wifiNote: 'El acceso WiFi siempre es gratis para los socios de Marriott Bonvoy'
        },
        entertainment: ['Habitación de alta tecnología con equipos listos para conexión', 'Cable/satélite'],
        accessibility: [],
        hotelHighlights: ['Este hotel es 100% libre de humo'],
        parkingAndTransport: ['Estacionamiento en el hotel, tarifa: 30,00 EUR por día'],
        hotelServices: ['Gimnasio en las instalaciones', 'Servicio de apertura de cama']
      }
    };
  }

  // Inicia la creación de una nueva habitación
  addNewRoom(): void {
    if (!this.selectedHotelId) return;
    this.formModel = this.createEmptyRoom();
    this.formModel.hotelId = this.selectedHotelId;
    this.isEditing = false;
    this.showForm = true;
    this.activeSection = 'basic';
    this.error = null;
    this.successMessage = null;
  }

  // Carga una habitación existente para edición
  editRoom(room: Room): void {
    this.formModel = JSON.parse(JSON.stringify(room));

    // Asegurar que la estructura de amenidades existe
    if (!this.formModel.amenities) {
      this.formModel.amenities = this.createEmptyRoom().amenities;
    }

    // Asegurar que existan ambas tarifas
    if (!this.formModel.rates || this.formModel.rates.length < 2) {
      const emptyRates = this.createEmptyRoom().rates;
      this.formModel.rates = [
        this.formModel.rates?.[0] || emptyRates[0],
        this.formModel.rates?.[1] || emptyRates[1]
      ];
    }

    this.isEditing = true;
    this.showForm = true;
    this.activeSection = 'basic';
    this.error = null;
    this.successMessage = null;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Guarda la habitación (crear o actualizar)
  saveRoom(f: NgForm): void {
    if (f.invalid) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.error = null;

    // Verificar si es edición (tiene ID válido y no es 0)
    const hasValidId = this.formModel.id && this.formModel.id !== 0 && this.formModel.id !== '0';

    if (this.isEditing && hasValidId) {
      // Actualizar habitación existente
      this.bookingService.updateRoom(this.formModel as Room).subscribe({
        next: () => {
          this.successMessage = 'Habitación actualizada correctamente';
          this.loadRooms(this.selectedHotelId!);
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: () => (this.error = 'Error al actualizar habitación')
      });
    } else {
      // Crear nueva habitación - generar ID numérico secuencial
      const roomToCreate = { ...this.formModel };

      // Generar ID numérico basado en el máximo ID existente + 1
      const maxId = this.rooms.reduce((max, room) => {
        const numId = typeof room.id === 'string' ? parseInt(room.id, 10) : room.id;
        return !isNaN(numId) && numId > max ? numId : max;
      }, 0);

      roomToCreate.id = String(maxId + 1);

      this.bookingService.createRoom(roomToCreate as Room).subscribe({
        next: () => {
          this.successMessage = 'Habitación creada correctamente';
          this.loadRooms(this.selectedHotelId!);
          this.resetForm(f);
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: () => (this.error = 'Error al crear habitación')
      });
    }
  }

  // Elimina una habitación
  deleteRoom(room: Room): void {
    if (!room.id || room.id === 0) {
      this.error = 'No se puede eliminar esta habitación (ID inválido)';
      return;
    }
    if (!confirm(`¿Eliminar la habitación "${room.name}"?`)) return;

    this.bookingService.deleteRoom(Number(room.id)).subscribe({
      next: () => {
        this.successMessage = 'Habitación eliminada correctamente';
        this.loadRooms(this.selectedHotelId!);
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => (this.error = 'Error al eliminar habitación')
    });
  }

  // Reinicia el formulario
  resetForm(f?: NgForm): void {
    if (f) f.resetForm();
    this.formModel = this.createEmptyRoom();
    if (this.selectedHotelId) {
      this.formModel.hotelId = this.selectedHotelId;
    }
    this.isEditing = false;
    this.showForm = false;
    this.activeSection = 'basic';
    this.error = null;
    this.newImageUrl = '';
  }

  // Cancela la edición
  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
  }

  // --- Gestión de imágenes ---
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

  // --- Toggle de amenidades ---
  isAmenitySelected(category: keyof typeof this.availableAmenities, amenity: string): boolean {
    const amenities = this.formModel.amenities;
    if (!amenities || !amenities[category]) return false;
    return amenities[category].includes(amenity);
  }

  toggleAmenity(category: keyof typeof this.availableAmenities, amenity: string): void {
    const amenities = this.formModel.amenities;
    if (!amenities[category]) {
      amenities[category] = [];
    }

    const index = amenities[category].indexOf(amenity);
    if (index > -1) {
      amenities[category].splice(index, 1);
    } else {
      amenities[category].push(amenity);
    }
  }

  // Cuenta las comodidades seleccionadas
  getSelectedAmenitiesCount(): number {
    const amenities = this.formModel.amenities;
    if (!amenities) return 0;

    let count = 0;
    count += amenities.specialBenefits?.length || 0;
    count += amenities.roomFeatures?.length || 0;
    count += amenities.bathroomFeatures?.length || 0;
    count += amenities.furnitureAndDecor?.length || 0;
    count += amenities.foodAndBeverages?.length || 0;
    count += amenities.entertainment?.length || 0;
    count += amenities.accessibility?.length || 0;
    count += amenities.hotelHighlights?.length || 0;
    count += amenities.parkingAndTransport?.length || 0;
    count += amenities.hotelServices?.length || 0;

    return count;
  }
}
