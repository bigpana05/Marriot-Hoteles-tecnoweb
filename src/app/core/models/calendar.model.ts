export interface CalendarDay {
    date: Date;
    dayNumber: number;
    isCurrentMonth: boolean;
    isAvailable: boolean;
    price: number | null;
    isSelected: boolean;
    isPast: boolean;
}

export interface CalendarWeek {
    days: CalendarDay[];
}
