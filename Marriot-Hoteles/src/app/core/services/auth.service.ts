import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';


export type UserRole = 'ADMIN' | 'CLIENT';


export interface User {
  id: number | null;
  email: string;
  name: string;
  password?: string; 
  role: UserRole;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';
  private readonly STORAGE_KEY = 'user_session_secure'; // Nombre clave para el storage

  // BehaviorSubject mantiene el estado del usuario en toda la app
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * RECUPERAR SESIÓN (Decodificar)
   * Al recargar la página, lee el string raro del SessionStorage y lo convierte a JSON real.
   */
  private loadStoredUser(): User | null {
    try {
      const encryptedData = sessionStorage.getItem(this.STORAGE_KEY);
      if (!encryptedData) return null;

      // atob() decodifica de Base64 a Texto normal
      const jsonString = atob(encryptedData);
      return JSON.parse(jsonString) as User;
    } catch (error) {
      console.error('Error al recuperar sesión corrupta', error);
      sessionStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  // --- GETTERS ---
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value?.token;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUserSubject.value?.role === role;
  }


  // --- LOGIN (Encriptar y Guardar) ---
  async login(email: string, password: string): Promise<User> {
    // 1. Petición al Backend (json-server)
    const url = `${this.API_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    const users = await firstValueFrom(this.http.get<User[]>(url));

    if (!users.length) {
      throw new Error('Credenciales inválidas');
    }

    const foundUser = users[0];

    // 2. Generar Token Base64 
    // Esto crea un string único basado en las credenciales
    const token = btoa(`${email}:${password}`);

    
    const userToSave: User = {
      ...foundUser,
      token: token
    };

    
    this.saveUserToStorage(userToSave);

    return userToSave;
  }


  // --- REGISTER (Crear, Encriptar y Guardar) ---
  async register(name: string, email: string, password: string): Promise<User> {
    // 1. Verificar si existe
    const checkUrl = `${this.API_URL}/users?email=${encodeURIComponent(email)}`;
    const existingUsers = await firstValueFrom(this.http.get<User[]>(checkUrl));

    if (existingUsers.length > 0) {
      throw new Error('El correo ya está registrado');
    }

    // 2. Crear usuario nuevo
    const newUser: User = {
      id: null,
      name: name,
      email: email,
      password: password, 
      role: 'CLIENT',
      token: btoa(`${email}:${password}`)
    };

    // 3. Guardar en DB
    const createdUser = await firstValueFrom(this.http.post<User>(`${this.API_URL}/users`, newUser));

    // 4. Auto-Login (Guardar ofuscado en Storage)
    this.saveUserToStorage(createdUser);

    return createdUser;
  }


  // --- LOGOUT ---
  logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY); // Borramos la data encriptada
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']); // Redirigir al login
  }


  // --- HELPER PRIVADO PARA GUARDAR ---
  private saveUserToStorage(user: User): void {
    // 1. Convertir objeto a string JSON
    const jsonString = JSON.stringify(user);
    
    // 2. Encriptar a Base64 (btoa)
    // Esto convierte '{"id":1...}' en algo como 'eyJpZCI6MS...'
    const encryptedData = btoa(jsonString);

    // 3. Guardar en SessionStorage
    sessionStorage.setItem(this.STORAGE_KEY, encryptedData);
    
    // 4. Actualizar estado de la app
    this.currentUserSubject.next(user);
  }
}