import { Component } from '@angular/core';

<<<<<<< HEAD
interface FeaturedHotel {
  name: string;
  city: string;
  rating: number;
  image: string;
}

=======
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
<<<<<<< HEAD
  year: number = new Date().getFullYear();

  // Modelo del buscador (solo para mostrar en pantalla)
  search = {
    city: '',
    checkIn: '',
    checkOut: ''
  };

  // Hoteles destacados de ejemplo
  featuredHotels: FeaturedHotel[] = [
    { name: 'Marriott Santiago',     city: 'Santiago',       rating: 4.6, image: 'assets/img/hotel-santiago.jpg' },
    { name: 'Marriott Buenos Aires', city: 'Buenos Aires',   rating: 4.7, image: 'assets/img/hotel-baires.jpg' },
    { name: 'Marriott Lima',         city: 'Lima',           rating: 4.5, image: 'assets/img/hotel-lima.jpg' },
    { name: 'Marriott Rio',          city: 'Río de Janeiro', rating: 4.8, image: 'assets/img/hotel-rio.jpg' }
  ];
=======

>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
}
