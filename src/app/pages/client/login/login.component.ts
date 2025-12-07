import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/client/profile']);
      }
    } catch (err: any) {
      console.error(err);
      this.error = err?.message || 'No se pudo iniciar sesión. Inténtalo nuevamente.';
    } finally {
      this.loading = false;
    }
  }
}
