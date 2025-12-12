import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  showPassword = false;
  showConfirmPassword = false;

  countries = ['USA', 'Chile', 'Argentina', 'Mexico', 'Spain']; //FALTAAAAAAAA

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      country: ['USA', Validators.required],
      zipCode: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    console.log('Formulario de registro OK:', this.registerForm.value);
    // Aquí después llamar  a tu AuthService para registrar
  }
}

@NgModule({
  declarations: [RegisterComponent],
  imports: [BrowserModule, ReactiveFormsModule, RouterModule.forRoot([])],
  providers: [],
  bootstrap: [RegisterComponent],
})
export class AppModule {}
