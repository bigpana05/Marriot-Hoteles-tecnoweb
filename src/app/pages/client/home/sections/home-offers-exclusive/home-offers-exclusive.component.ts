import { Component, OnInit, OnDestroy } from '@angular/core';
import { Coupon } from 'src/app/core/models/coupon.model';
import { CouponService } from 'src/app/core/services/coupon.service';

const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 920;
const BREAKPOINT_LAPTOP = 1200;
const ITEM_WIDTH_DESKTOP = 364;
const ITEM_WIDTH_TABLET = 300;
const CAROUSEL_GAP = 20;

@Component({
  selector: 'app-home-offers-exclusive',
  templateUrl: './home-offers-exclusive.component.html',
  styleUrls: ['./home-offers-exclusive.component.scss'],
})
export class HomeOffersExclusiveComponent implements OnInit, OnDestroy {
  // USAMOS CUPONES EN LUGAR DE OFERTAS
  coupons: Coupon[] = [];

  couponImages: string[] = [
    'assets/brand/offers/image1.jpg',
    'assets/brand/offers/image2.jpg',
    'assets/brand/offers/image3.jpg',
  ];

  currentSlide = 0;
  itemsPerSlide = 3;
  itemWidth = ITEM_WIDTH_DESKTOP;
  gap = CAROUSEL_GAP;

  private resizeListener: () => void;

  constructor(private couponService: CouponService) {
    this.resizeListener = () => this.checkScreenSize();
  }

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', this.resizeListener);
    this.loadPublicCoupons();
  }

  loadPublicCoupons(): void {
    this.couponService.getAll().subscribe({
      next: (data) => {
        const today = new Date().toISOString().split('T')[0];
        // Filtramos solo los que son PÚBLICOS y ACTIVOS
        this.coupons = data.filter(
          (c) => c.isActive && c.isPublic && c.validUntil >= today
        );
      },
      error: (err) => console.error('Error cargando cupones', err),
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }

  getImage(index: number): string {
    return this.couponImages[index % this.couponImages.length];
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      alert(`¡Código ${code} copiado!`);
    });
  }

  checkScreenSize(): void {
    const width = window.innerWidth;
    if (width < BREAKPOINT_MOBILE) {
      this.itemsPerSlide = 1;
    } else if (width <= BREAKPOINT_TABLET) {
      this.itemWidth = ITEM_WIDTH_TABLET;
      this.itemsPerSlide = 2;
    } else if (width <= BREAKPOINT_LAPTOP) {
      this.itemWidth = ITEM_WIDTH_DESKTOP;
      this.itemsPerSlide = 2;
    } else {
      this.itemWidth = ITEM_WIDTH_DESKTOP;
      this.itemsPerSlide = 3;
    }
    if (this.currentSlide >= this.totalSlides) this.currentSlide = 0;
  }

  get transformStyle(): string {
    if (this.itemsPerSlide === 1) {
      return `translateX(-${this.currentSlide * 100}%)`;
    } else {
      const shift = this.currentSlide * (this.itemWidth + this.gap);
      return `translateX(-${shift}px)`;
    }
  }

  get totalSlides(): number {
    if (this.coupons.length === 0) return 0;
    if (this.itemsPerSlide === 1) return this.coupons.length;
    const max = this.coupons.length - this.itemsPerSlide + 1;
    return max > 0 ? max : 1;
  }

  get slides(): number[] {
    return Array.from({ length: this.totalSlides }, (_, i) => i);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  prevSlide(): void {
    this.currentSlide =
      (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }
}
