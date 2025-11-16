import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';

  /** BehaviorSubject que mantiene el usuario actual */
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Leer usuario guardado en localStorage */
  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  /** Getter práctico del usuario actual */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /** ¿Existe sesión activa? */
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value?.token;
  }

  /** ¿El usuario tiene un rol específico? */
  hasRole(role: UserRole): boolean {
    return this.currentUserSubject.value?.role === role;
  }

  /** Login contra json-server */
  async login(email: string, password: string): Promise<User> {
    const url =
      `${this.API_URL}/users?email=` +
      encodeURIComponent(email) +
      `&password=` +
      encodeURIComponent(password);

    const users = await firstValueFrom(this.http.get<User[]>(url));

    if (!users.length) {
      throw new Error('Credenciales inválidas');
    }

    const user: User = {
      ...users[0],
      token: 'fake-jwt-demo' // Token de sesión fake para testing
    };

    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);

    return user;
  }

  /** Cerrar sesión */
  logout(): void {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}
