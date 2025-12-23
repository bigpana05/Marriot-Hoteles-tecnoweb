import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Coupon } from 'src/app/core/models/coupon.model';
import { CouponService } from 'src/app/core/services/coupon.service';

@Component({
  selector: 'app-admin-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.scss']
})
export class AdminCouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  
  formModel: Coupon = {
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    validUntil: '',
    isActive: true,
    isPublic: true,
    description: ''
  };

  isEditing = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Getter para obtener la fecha de hoy (para validación del input date)
  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  constructor(private couponService: CouponService) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.couponService.getAll().subscribe({
      next: (data) => this.coupons = data,
      error: (err) => console.error('Error cargando cupones', err)
    });
  }

  // VALIDACIÓN Y GUARDADO
  save(f: NgForm): void {
    if (f.invalid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos correctamente.';
      return;
    }

    // Validación extra de lógica de negocio
    if (this.formModel.discountType === 'PERCENTAGE' && this.formModel.discountValue > 100) {
      this.errorMessage = 'El descuento por porcentaje no puede superar el 100%.';
      return;
    }

    if (this.formModel.discountValue <= 0) {
      this.errorMessage = 'El valor del descuento debe ser mayor a 0.';
      return;
    }

    // Limpiar espacios en blanco del código
    this.formModel.code = this.formModel.code.trim().toUpperCase();

    if (this.isEditing && this.formModel.id) {
      this.couponService.update(this.formModel).subscribe({
        next: () => {
          this.successMessage = 'Cupón actualizado correctamente.';
          this.finalizeAction(f);
        },
        error: () => this.errorMessage = 'Error al actualizar. Verifica que el servidor esté activo.'
      });
    } else {
      this.couponService.create(this.formModel).subscribe({
        next: () => {
          this.successMessage = 'Cupón creado correctamente.';
          this.finalizeAction(f);
        },
        error: () => this.errorMessage = 'Error al crear. Verifica que el servidor esté activo.'
      });
    }
  }

  finalizeAction(f: NgForm): void {
    this.resetForm(f);
    this.loadCoupons();
    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 3000);
  }

  edit(coupon: Coupon): void {
    this.formModel = { ...coupon };
    this.isEditing = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ELIMINAR (Manejo de errores mejorado)
  delete(id: number | string): void {
    if (confirm('¿Estás seguro de eliminar este cupón? Esta acción no se puede deshacer.')) {
      this.couponService.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Cupón eliminado exitosamente.';
          this.loadCoupons();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = `No se pudo eliminar el cupón (ID: ${id}). Intenta recargar la página.`;
        }
      });
    }
  }

  resetForm(f?: NgForm): void {
    if (f) f.resetForm();
    this.isEditing = false;
    this.formModel = {
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      validUntil: '',
      isActive: true,
      isPublic: true,
      description: ''
    };
  }
}