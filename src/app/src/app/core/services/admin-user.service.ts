import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly API_URL = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  createUser(
    user: Omit<User, 'id' | 'token'> & { password: string }
  ): Observable<User> {
    return this.http.post<User>(this.API_URL, user);
  }

  updateUser(user: User & { password?: string }): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${user.id}`, user);
  }

  deleteUser(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
