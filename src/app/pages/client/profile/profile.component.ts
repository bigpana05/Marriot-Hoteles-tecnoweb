import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isEditing = false;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  private destroy$ = new Subject<void>();

  // Campos editables
  editFirstName = '';
  editLastName = '';
  editCountry = '';
  editPostalCode = '';
  editCity = '';
  editAddressLine1 = '';
  editAddressLine2 = '';

  // Cambio de contraseña
  isChangingPassword = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError: string | null = null;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Suscribirse al usuario actual con takeUntil para evitar memory leaks
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        this.initializeEditFields();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Inicializa los campos de edición con los datos actuales
  private initializeEditFields(): void {
    if (this.user) {
      this.editFirstName = this.user.firstName || '';
      this.editLastName = this.user.lastName || '';
      this.editCountry = this.user.country || '';
      this.editPostalCode = this.user.postalCode || '';
      this.editCity = this.user.city || '';
      this.editAddressLine1 = this.user.addressLine1 || '';
      this.editAddressLine2 = this.user.addressLine2 || '';
    }
  }

  get isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }

  // Activa el modo de edición
  startEditing(): void {
    this.isEditing = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.initializeEditFields();
  }

  // Cancela la edición y restaura los valores originales
  cancelEditing(): void {
    this.isEditing = false;
    this.errorMessage = null;
    this.successMessage = null;
    this.initializeEditFields();
  }

  /**
   * Guarda los cambios del perfil
   * Actualiza firstName y lastName del usuario
   */
  async saveChanges(): Promise<void> {
    if (!this.user?.id) {
      return;
    }

    // Validar que los campos no estén vacíos
    if (!this.editFirstName.trim() || !this.editLastName.trim()) {
      this.errorMessage = 'El nombre y apellido son obligatorios';
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      // Actualizar usuario a través del servicio
      await this.authService.updateUser(this.user.id, {
        firstName: this.editFirstName.trim(),
        lastName: this.editLastName.trim(),
        country: this.editCountry.trim(),
        postalCode: this.editPostalCode.trim(),
        city: this.editCity.trim(),
        addressLine1: this.editAddressLine1.trim(),
        addressLine2: this.editAddressLine2.trim()
      });

      this.successMessage = 'Cambios guardados exitosamente';
      this.isEditing = false;

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      this.errorMessage = error?.message || 'No se pudieron guardar los cambios';
    } finally {
      this.isSaving = false;
    }
  }

  // Activar modo de cambio de contraseña
  startChangingPassword(): void {
    this.isChangingPassword = true;
    this.passwordError = null;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  // Cancelar cambio de contraseña
  cancelPasswordChange(): void {
    this.isChangingPassword = false;
    this.passwordError = null;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  /**
   * Guarda la nueva contraseña con validaciones
   * Valida: contraseña actual, longitud mínima, y confirmación
   */
  async savePassword(): Promise<void> {
    if (!this.user?.id) {
      return;
    }

    this.passwordError = null;

    // Validar que todos los campos estén completos
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Todos los campos son obligatorios';
      return;
    }

    // Validar longitud mínima de la nueva contraseña
    if (this.newPassword.length < 6) {
      this.passwordError = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden';
      return;
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (this.currentPassword === this.newPassword) {
      this.passwordError = 'La nueva contraseña debe ser diferente a la actual';
      return;
    }

    this.isSaving = true;

    try {
      // Actualizar contraseña a través del servicio
      await this.authService.updatePassword(
        this.user.id,
        this.currentPassword,
        this.newPassword
      );

      this.successMessage = 'Contraseña actualizada exitosamente';
      this.isChangingPassword = false;
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    } catch (error: any) {
      console.error('Error al actualizar contraseña:', error);
      this.passwordError = error?.message || 'No se pudo actualizar la contraseña';
    } finally {
      this.isSaving = false;
    }
  }

  // Navegar a Mis Reservas
  goToMyReservations(): void {
    this.router.navigate(['/client/my-reservations']);
  }

  // Navegar a Catálogo
  goToCatalog(): void {
    this.router.navigate(['/client/catalog']);
  }

  // Alternar visibilidad de nueva contraseña
  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  // Alternar visibilidad de confirmar contraseña
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Cerrar sesión
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/client/login']);
  }
}
