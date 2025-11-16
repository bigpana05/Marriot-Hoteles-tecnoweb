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

<<<<<<< HEAD
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid || this.loading) return;

    this.error = null;
    this.loading = true;

    try {
      const user = await this.auth.login(this.email, this.password);

      if (user.role === 'ADMIN') {
=======
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
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/client/profile']);
      }
<<<<<<< HEAD
    } catch (err: any) {
      console.error(err);
      this.error = err?.message || 'No se pudo iniciar sesión. Inténtalo nuevamente.';
=======
    } catch (err) {
      console.error(err);
      this.error = 'No se pudo iniciar sesión. Inténtalo nuevamente.';
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
    } finally {
      this.loading = false;
    }
  }
}
