import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DateRange } from '../../../../../../models/date-range.model';

@Component({
  selector: 'app-date-picker-dropdown',
  templateUrl: './date-picker-dropdown.component.html',
  styleUrls: ['./date-picker-dropdown.component.scss']
})
export class DatePickerDropdownComponent {
  @Input() isOpen: boolean = false;
  @Output() datesSelected = new EventEmitter<DateRange>();
  @Output() close = new EventEmitter<void>();

  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  currentMonth: Date = new Date(2025, 11, 1); // Diciembre 2025
  nextMonth: Date = new Date(2026, 0, 1); // Enero 2026

  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Genera los días del mes para el calendario
  generateCalendarDays(month: Date): (number | null)[] {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const days: (number | null)[] = [];

    // Agregar días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Agregar días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }

  // Obtiene los días del mes actual
  get currentMonthDays(): (number | null)[] {
    return this.generateCalendarDays(this.currentMonth);
  }

  // Obtiene los días del mes siguiente
  get nextMonthDays(): (number | null)[] {
    return this.generateCalendarDays(this.nextMonth);
  }

  // Selecciona una fecha
  selectDate(day: number, month: Date): void {
    const selectedDate = new Date(month.getFullYear(), month.getMonth(), day);

    if (!this.checkInDate || (this.checkInDate && this.checkOutDate)) {
      // Primera selección o reiniciar
      this.checkInDate = selectedDate;
      this.checkOutDate = null;
    } else if (this.checkInDate && !this.checkOutDate) {
      // Segunda selección
      if (selectedDate > this.checkInDate) {
        this.checkOutDate = selectedDate;
      } else {
        // Si selecciona una fecha anterior al check-in, reinicia
        this.checkInDate = selectedDate;
        this.checkOutDate = null;
      }
    }
  }

  // Verifica si un día está seleccionado
  isSelected(day: number, month: Date): boolean {
    if (!day) return false;
    const date = new Date(month.getFullYear(), month.getMonth(), day);

    if (!this.checkInDate && !this.checkOutDate) return false;

    return (
      (this.checkInDate !== null && this.isSameDay(date, this.checkInDate)) ||
      (this.checkOutDate !== null && this.isSameDay(date, this.checkOutDate))
    );
  }

  // Verifica si un día está en el rango
  isInRange(day: number, month: Date): boolean {
    if (!day || !this.checkInDate || !this.checkOutDate) return false;
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    return date > this.checkInDate && date < this.checkOutDate;
  }

  // Compara si dos fechas son el mismo día
  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  // Resetea las fechas
  resetDates(): void {
    this.checkInDate = null;
    this.checkOutDate = null;
  }

  // Confirma las fechas seleccionadas
  confirmDates(): void {
    if (this.checkInDate && this.checkOutDate) {
      this.datesSelected.emit({
        checkIn: this.checkInDate,
        checkOut: this.checkOutDate
      });
      this.closeDropdown();
    }
  }

  // Cierra el dropdown
  closeDropdown(): void {
    this.close.emit();
  }

  // Calcula el número de noches
  get numberOfNights(): number {
    if (this.checkInDate && this.checkOutDate) {
      const diffTime = Math.abs(this.checkOutDate.getTime() - this.checkInDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }
}
