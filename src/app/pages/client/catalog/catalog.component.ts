import { Component, OnInit } from '@angular/core';
import { Hotel } from 'src/app/core/models/hotel.model';
import { HotelService } from 'src/app/core/services/hotel.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit {
  // Array para almacenar la lista de hoteles traída del servidor
  hotels: Hotel[] = [];

  // Inyectamos el servicio en el constructor
  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadHotels();
  }

  // Método para consumir el servicio
  loadHotels() {
    this.hotelService.getHotels().subscribe({
      next: (data) => {
        this.hotels = data;
        console.log('Hoteles cargados:', this.hotels);
      },
      error: (err) => {
        console.error('Error al cargar hoteles:', err);
      },
    });
  }
}
