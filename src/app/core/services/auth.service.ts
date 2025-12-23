import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: number | string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  token?: string;
  bonvoyNumber?: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';

  /** BehaviorSubject que mantiene el usuario actual */
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.loadStoredUser()
  );
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
      token: 'fake-jwt-demo', // Token de sesión fake para testing
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

  /** Obtener usuario actual */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Genera un número de miembro Bonvoy único
   */
  private generateBonvoyNumber(): Observable<string> {
    return this.http.get<User[]>(`${this.API_URL}/users`).pipe(
      map(users => {
        const maxNumber = users.reduce((max, user) => {
          if (user.bonvoyNumber) {
            const num = parseInt(user.bonvoyNumber.replace(/\D/g, ''), 10);
            return num > max ? num : max;
          }
          return max;
        }, 0);
        const newNumber = maxNumber + 1;
        return `BON${newNumber.toString().padStart(6, '0')}`;
      })
    );
  }

  /**
   * Registra un nuevo usuario
   */
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<User> {
    // Verificar si el email ya existe
    const existingUsers = await firstValueFrom(
      this.http.get<User[]>(`${this.API_URL}/users?email=${encodeURIComponent(userData.email)}`)
    );

    if (existingUsers.length > 0) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // Generar número de miembro
    const bonvoyNumber = await firstValueFrom(this.generateBonvoyNumber());

    // Crear nuevo usuario
    const newUser = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: `${userData.firstName} ${userData.lastName}`,
      role: 'CLIENT' as UserRole,
      token: `token-${Date.now()}`,
      bonvoyNumber: bonvoyNumber
    };

    // Guardar en la base de datos
    const createdUser = await firstValueFrom(
      this.http.post<User>(`${this.API_URL}/users`, newUser)
    );

    // Iniciar sesión automáticamente
    const userWithToken: User = {
      ...createdUser,
      token: `token-${Date.now()}`
    };

    localStorage.setItem('user', JSON.stringify(userWithToken));
    this.currentUserSubject.next(userWithToken);

    return userWithToken;
  }
}
