import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-hotels-carousel',
  templateUrl: './hotels-carousel.component.html',
  styleUrls: ['./hotels-carousel.component.scss'],
})
export class HotelsCarouselComponent {
  hotelImages: string[] = [
    '/assets/brand/hotels/Marriott_International-Castillo_Hotel_Son_Vida-a_Luxury_Collection_Hotel-Mallorca-ref185756.jpg',
    '/assets/brand/hotels/Marriott_International-Marriott_Resort_Palm_Jumeirah-Dubai-ref163347.jpg',
  ];

  isMobile: boolean = false;

  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 640;
  }

  get displayedImages(): string[] {
    return this.isMobile ? [this.hotelImages[0]] : this.hotelImages;
  }

  onImageError(event: any, imagePath: string): void {
    console.error('Failed to load image:', imagePath);
    console.error('Error event:', event);
  }

  onImageLoad(imagePath: string): void {
    console.log('Successfully loaded image:', imagePath);
  }
}
