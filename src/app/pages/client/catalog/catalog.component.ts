import { Component, OnInit } from '@angular/core';
import { Hotel } from '../../../src/app/core/models/hotel.model';
import { HotelService } from '../../../src/app/core/services/hotel.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit {
  hotels: Hotel[] = [];
  loading = false;
  error: string | null = null;

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadHotels();
  }

  private loadHotels(): void {
    this.loading = true;
    this.error = null;

    this.hotelService.getHotels().subscribe({
      next: (hotels) => {
        this.hotels = hotels;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando hoteles', err);
        this.error =
          'No se pudo cargar el catálogo de hoteles. Inténtalo nuevamente.';
        this.loading = false;
      },
    });
  }

  trackById(index: number, hotel: Hotel): number | string {
    return hotel.id ?? index;
  }
}
