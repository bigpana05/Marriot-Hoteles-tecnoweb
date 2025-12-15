import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  
  countries = ['USA', 'Chile', 'Argentina', 'Mexico', 'Spain'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, 
    private router: Router            
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      country: ['USA', Validators.required],
      zipCode: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]], 
      confirmPassword: ['', Validators.required]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Convertimos a async para esperar al servicio
  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, password, confirmPassword } = this.registerForm.value;

    // Validación de coincidencia
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Unimos Nombre y Apellido para guardarlo como "name" en la interfaz User
    const fullName = `${firstName} ${lastName}`;

    try {
      // 3. LLAMADA AL SERVICIO (Aquí ocurre la seguridad)
      // El servicio se encargará de encriptar (btoa) y guardar en SessionStorage
      await this.authService.register(fullName, email, password);

      // 4. Redirección exitosa
      // Puedes mandar al home o al login
      this.router.navigate(['/client/home']); 

    } catch (error: any) {
      console.error(error);
      alert('Error al registrar: ' + (error.message || 'Intente nuevamente'));
    }
  }
}