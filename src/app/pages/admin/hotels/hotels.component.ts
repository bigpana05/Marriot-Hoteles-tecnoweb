import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HotelService } from '../../../core/services/hotel.service';
import { Hotel } from '../../../core/models/hotel.model';

@Component({
  selector: 'app-hotels',
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {
  hotels: Hotel[] = [];
  loading = false;
  error: string | null = null;

  formModel: Hotel = {
    id: undefined,
    name: '',
    city: '',
    country: '',
    address: '',
    roomTypes: '',
    basePrice: 0,
    availableRooms: 0,
    totalRooms: 0
  };

  constructor(private hotelService: HotelService) {}

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

  edit(h: Hotel): void {
    this.formModel = { ...h };
  }

  resetForm(f: NgForm): void {
    f.resetForm({
      id: undefined,
      name: '',
      city: '',
      country: '',
      address: '',
      roomTypes: '',
      basePrice: 0,
      availableRooms: 0,
      totalRooms: 0
    });
    this.error = null;
  }

  save(f: NgForm): void {
    if (f.invalid) return;
    this.error = null;

    const payload: Hotel = { ...this.formModel };

    if (payload.id) {
      this.hotelService.updateHotel(payload).subscribe({
        next: () => {
          this.loadHotels();
          this.resetForm(f);
        },
        error: () => (this.error = 'Error al actualizar hotel')
      });
    } else {
      this.hotelService.createHotel(payload).subscribe({
        next: () => {
          this.loadHotels();
          this.resetForm(f);
        },
        error: () => (this.error = 'Error al crear hotel')
      });
    }
  }

  delete(h: Hotel): void {
    if (!h.id) return;
    if (!confirm(`¿Eliminar el hotel "${h.name}"?`)) return;
    this.hotelService.deleteHotel(h.id).subscribe({
      next: () => this.loadHotels(),
      error: () => (this.error = 'Error al eliminar hotel')
    });
  }
}
