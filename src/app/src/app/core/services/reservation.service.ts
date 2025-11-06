import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  // Simula un pago asíncrono usando Promise (requisito del proyecto)
  pay(): Promise<{ ok: boolean; id: string }> {
    const genId =
      (crypto as any)?.randomUUID?.() || Math.random().toString(36).slice(2);
    return new Promise((resolve) =>
      setTimeout(() => resolve({ ok: true, id: genId }), 1200)
    );
  }
}
