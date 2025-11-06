import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStored());
  currentUser$ = this.currentUserSubject.asObservable();

  private getStored(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Mock simple: si el email contiene 'admin' => rol ADMIN, si no CLIENT.
  login(email: string, _password: string) {
    const role: UserRole = email.includes('admin') ? 'ADMIN' : 'CLIENT';
    const user: User = { id: 1, email, name: email.split('@')[0], role, token: 'demo' };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}
