import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;

  // Modelo del formulario
  formModel = {
    id: null as number | null,
    name: '',
    email: '',
    password: '',
    role: 'CLIENT' as 'ADMIN' | 'CLIENT'
  };

  constructor(private adminUserService: AdminUserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminUserService.getUsers().subscribe({
      next: users => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }

  edit(user: User): void {
    this.formModel = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    };
  }

  resetForm(form: NgForm): void {
    form.resetForm({
      id: null,
      name: '',
      email: '',
      password: '',
      role: 'CLIENT'
    });
    this.error = null;
  }

  save(form: NgForm): void {
    if (form.invalid) return;
    this.error = null;

    const payload: any = {
      name: this.formModel.name,
      email: this.formModel.email,
      role: this.formModel.role,
      password: this.formModel.password || 'changeme'
    };

    if (this.formModel.id) {
      payload.id = this.formModel.id;
      this.adminUserService.updateUser(payload).subscribe({
        next: () => {
          this.loadUsers();
          this.resetForm(form);
        },
        error: () => (this.error = 'Error al actualizar usuario')
      });
    } else {
      this.adminUserService.createUser(payload).subscribe({
        next: () => {
          this.loadUsers();
          this.resetForm(form);
        },
        error: () => (this.error = 'Error al crear usuario')
      });
    }
  }

  deleteUser(user: User): void {
    if (!user.id) return;
    if (!confirm(`¿Eliminar al usuario ${user.name}?`)) return;

    this.adminUserService.deleteUser(user.id).subscribe({
      next: () => this.loadUsers(),
      error: () => (this.error = 'Error al eliminar usuario')
    });
  }
}
