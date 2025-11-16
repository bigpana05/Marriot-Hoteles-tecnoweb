import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReservationItemDTO } from '../../shared/models/reservation.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<ReservationItemDTO[]>([]);
  items$ = this.itemsSubject.asObservable();

  addItem(item: ReservationItemDTO) {
    this.itemsSubject.next([...this.itemsSubject.value, item]);
  }
  removeIndex(idx: number) {
    const arr = [...this.itemsSubject.value];
    arr.splice(idx, 1);
    this.itemsSubject.next(arr);
  }
  clear() {
    this.itemsSubject.next([]);
  }

  total$ = this.items$.pipe(
    map((items) => items.reduce((t, i) => t + i.qty * i.price, 0))
  );
}
