import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  error: string | null = null;
  emailExists = false;
  passwordMismatch = false;

  // Lista de países disponibles para selección
  countries = [
    'Chile',
    'Estados Unidos',
    'Argentina',
    'México',
    'España',
    'Colombia',
    'Perú',
    'Brasil'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      country: ['Chile', Validators.required],
      zipCode: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    });

    // Limpiar error de email cuando cambie el valor
    this.registerForm.get('email')?.valueChanges.subscribe(() => {
      this.emailExists = false;
    });

    // Verificar coincidencia de contraseñas en tiempo real
    this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });

    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });
  }

  // Verifica si las contraseñas coinciden
  private checkPasswordMatch(): void {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;

    if (confirmPassword && password !== confirmPassword) {
      this.passwordMismatch = true;
    } else {
      this.passwordMismatch = false;
    }
  }

  // Alterna visibilidad de la contraseña
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Alterna visibilidad de confirmar contraseña
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Procesa el formulario de registro
   * Valida los campos y llama al AuthService para crear la cuenta
   * El AuthService genera automáticamente el número de miembro (bonvoyNumber)
   */
  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { password, confirmPassword, firstName, lastName, email } = this.registerForm.value;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.error = null;
    this.emailExists = false;
    this.loading = true;

    try {
      // Llamar al servicio de autenticación para registrar
      // El AuthService genera automáticamente el bonvoyNumber (member ID)
      const user = await this.authService.register({
        firstName,
        lastName,
        email,
        password
      });

      console.log('Usuario registrado exitosamente:', user);
      console.log('Número de miembro asignado:', user.bonvoyNumber);

      // Redirigir al perfil después del registro exitoso
      this.router.navigate(['/client/profile']);

    } catch (err: any) {
      console.error('Error en registro:', err);

      // Verificar si es error de email duplicado
      if (err?.message?.includes('ya está registrado')) {
        this.emailExists = true;
      } else {
        this.error = err?.message || 'Error al registrar. Por favor, inténtalo nuevamente.';
      }
    } finally {
      this.loading = false;
    }
  }
}
