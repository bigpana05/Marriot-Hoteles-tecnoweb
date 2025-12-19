import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Hotel } from 'src/app/core/models/hotel.model';
import { HotelService } from 'src/app/core/services/hotel.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit, OnDestroy {
  // Array para almacenar la lista de hoteles traída del servidor
  hotels: Hotel[] = [];

  // Estado de carga
  isLoading = false;

  // Subject para manejar la destrucción del componente
  private destroy$ = new Subject<void>();

  // Inyectamos el servicio en el constructor
  constructor(private hotelService: HotelService) { }

  ngOnInit(): void {
    this.loadHotels();
  }

  // Método para consumir el servicio
  loadHotels(): void {
    this.isLoading = true;

    this.hotelService.getHotels()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.hotels = data;
          this.isLoading = false;
          console.log('Hoteles cargados:', this.hotels);
        },
        error: (err) => {
          console.error('Error al cargar hoteles:', err);
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
