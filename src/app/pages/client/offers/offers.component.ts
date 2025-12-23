import { Component, OnInit } from '@angular/core';
import { Coupon } from 'src/app/core/models/coupon.model';
import { CouponService } from 'src/app/core/services/coupon.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
})
export class OffersComponent implements OnInit {
  coupons: Coupon[] = [];

  constructor(private couponService: CouponService) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.couponService.getAll().subscribe({
      next: (data) => {
        const today = new Date().toISOString().split('T')[0];
        // Filtramos solo Activos, Públicos y Vigentes
        this.coupons = data.filter(
          (c) => c.isActive && c.isPublic && c.validUntil >= today
        );
      },
      error: (err) => console.error('Error al cargar cupones', err),
    });
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      alert(`¡Código ${code} copiado al portapapeles!`);
    });
  }
}
