import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EncryptionService } from './encryption.service';

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
  country?: string;
  postalCode?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';

  /** BehaviorSubject que mantiene el usuario actual */
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.loadStoredUser()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private encryptionService: EncryptionService
  ) { }

  /** Leer usuario guardado en localStorage (encriptado) */
  private loadStoredUser(): User | null {
    try {
      const user = this.encryptionService.getSecureItem('user');
      return user;
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

  /** Login contra json-server con verificación de contraseña hasheada */
  async login(email: string, password: string): Promise<User> {
    // Buscar usuario solo por email
    const url = `${this.API_URL}/users?email=` + encodeURIComponent(email);
    const users = await firstValueFrom(this.http.get<User[]>(url));

    if (!users.length) {
      throw new Error('Credenciales inválidas');
    }

    const dbUser = users[0];

    // Verificar contraseña usando bcrypt
    const passwordMatch = await this.encryptionService.verifyPassword(
      password,
      dbUser.password || ''
    );

    if (!passwordMatch) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token de sesión seguro
    const sessionToken = this.encryptionService.generateToken(64);

    // Preparar usuario sin contraseña
    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: dbUser.role,
      bonvoyNumber: dbUser.bonvoyNumber,
      country: dbUser.country,
      postalCode: dbUser.postalCode,
      city: dbUser.city,
      addressLine1: dbUser.addressLine1,
      addressLine2: dbUser.addressLine2,
      token: sessionToken,
      // NO incluir password en el objeto de sesión
    };

    // Guardar en localStorage de forma encriptada
    this.encryptionService.setSecureItem('user', user);
    this.currentUserSubject.next(user);

    return user;
  }

  /** Cerrar sesión */
  logout(): void {
    this.encryptionService.removeSecureItem('user');
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

    // Hashear contraseña con bcrypt
    const hashedPassword = await this.encryptionService.hashPassword(userData.password);

    // Generar número de miembro
    const bonvoyNumber = await firstValueFrom(this.generateBonvoyNumber());

    // Generar token de sesión seguro
    const sessionToken = this.encryptionService.generateToken(64);

    // Crear nuevo usuario con contraseña hasheada
    const newUser = {
      email: userData.email,
      password: hashedPassword, // Contraseña encriptada
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: `${userData.firstName} ${userData.lastName}`,
      role: 'CLIENT' as UserRole,
      bonvoyNumber: bonvoyNumber
    };

    // Guardar en la base de datos
    const createdUser = await firstValueFrom(
      this.http.post<User>(`${this.API_URL}/users`, newUser)
    );

    // Preparar usuario para sesión (sin contraseña)
    const userWithToken: User = {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      role: createdUser.role,
      bonvoyNumber: createdUser.bonvoyNumber,
      token: sessionToken,
      // NO incluir password
    };

    // Guardar en localStorage de forma encriptada
    this.encryptionService.setSecureItem('user', userWithToken);
    this.currentUserSubject.next(userWithToken);

    return userWithToken;
  }

  /**
   * Actualiza los datos del usuario actual
   * @param userId - ID del usuario a actualizar
   * @param userData - Datos parciales a actualizar (firstName, lastName)
   * @returns Promise con el usuario actualizado
   */
  async updateUser(userId: number | string, userData: Partial<User>): Promise<User> {
    // Actualizar en la base de datos
    const updatedUser = await firstValueFrom(
      this.http.patch<User>(`${this.API_URL}/users/${userId}`, userData)
    );

    // Recalcular el nombre completo si se actualizaron firstName o lastName
    if (userData.firstName || userData.lastName) {
      const firstName = userData.firstName || updatedUser.firstName || '';
      const lastName = userData.lastName || updatedUser.lastName || '';
      updatedUser.name = `${firstName} ${lastName}`;

      // Actualizar el nombre en la base de datos
      await firstValueFrom(
        this.http.patch<User>(`${this.API_URL}/users/${userId}`, { name: updatedUser.name })
      );
    }

    // Mantener el token actual
    const userWithToken: User = {
      ...updatedUser,
      token: this.currentUser?.token || `token-${Date.now()}`
    };

    // Actualizar el localStorage y el BehaviorSubject (encriptado)
    this.encryptionService.setSecureItem('user', userWithToken);
    this.currentUserSubject.next(userWithToken);

    return userWithToken;
  }

  /**
   * Actualiza la contraseña del usuario actual
   * @param userId - ID del usuario
   * @param currentPassword - Contraseña actual para validación
   * @param newPassword - Nueva contraseña
   * @returns Promise con el usuario actualizado
   */
  async updatePassword(userId: number | string, currentPassword: string, newPassword: string): Promise<User> {
    // Obtener el usuario actual de la base de datos para validar la contraseña
    const user = await firstValueFrom(
      this.http.get<User>(`${this.API_URL}/users/${userId}`)
    );

    // Verificar que la contraseña actual sea correcta usando bcrypt
    const passwordMatch = await this.encryptionService.verifyPassword(
      currentPassword,
      user.password || ''
    );

    if (!passwordMatch) {
      throw new Error('La contraseña actual no es correcta');
    }

    // Hashear la nueva contraseña
    const hashedPassword = await this.encryptionService.hashPassword(newPassword);

    // Actualizar la contraseña en la base de datos
    await firstValueFrom(
      this.http.patch<User>(`${this.API_URL}/users/${userId}`, { password: hashedPassword })
    );

    // Mantener el token actual y datos del usuario (sin contraseña)
    const currentSessionUser = this.currentUser;
    if (currentSessionUser) {
      // No es necesario actualizar nada más que confirmar que la operación fue exitosa
      return currentSessionUser;
    }

    throw new Error('Sesión inválida');
  }
}
