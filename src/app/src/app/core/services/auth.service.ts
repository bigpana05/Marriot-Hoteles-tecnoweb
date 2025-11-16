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

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.loadStoredUser()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Lee usuario guardado en localStorage (si existe) */
  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  /** Usuario actual (conveniente para templates) */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /** ¿Hay sesión iniciada? */
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value?.token;
  }

  /** ¿El usuario tiene este rol? */
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
      token: 'fake-jwt-demo'
    };

    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return user;
  }

  logout(): void {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}
