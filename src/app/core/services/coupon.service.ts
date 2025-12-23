import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coupon } from '../models/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private readonly API_URL = 'http://localhost:3000/coupons';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.API_URL);
  }

  getById(id: number | string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.API_URL}/${id}`);
  }

  create(coupon: Coupon): Observable<Coupon> {
    // Forzamos el código a mayúsculas
    coupon.code = coupon.code.toUpperCase();
    return this.http.post<Coupon>(this.API_URL, coupon);
  }

  update(coupon: Coupon): Observable<Coupon> {
    coupon.code = coupon.code.toUpperCase();
    return this.http.put<Coupon>(`${this.API_URL}/${coupon.id}`, coupon);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}