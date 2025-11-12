import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.invalid || this.loading) {
      form.control.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      this.authService.login(this.email, this.password);
      const user = this.authService.currentUserValue;

      if (user?.role === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/client/profile']);
      }
    } catch (err) {
      console.error(err);
      this.error = 'No se pudo iniciar sesión. Inténtalo nuevamente.';
    } finally {
      this.loading = false;
    }
  }
}
