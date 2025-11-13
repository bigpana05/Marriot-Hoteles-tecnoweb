import { Component, OnInit } from '@angular/core';
import { AdminUserService } from '../../../src/app/core/services/admin-user.service';
import { HotelService } from '../../../src/app/core/services/hotel.service';
import { EventService } from '../../../src/app/core/services/event.service';
import { User } from '../../../src/app/core/services/auth.service';
import { Hotel } from '../../../src/app/core/models/hotel.model';
import { Event } from '../../../src/app/core/models/event.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  hotels: Hotel[] = [];
  events: Event[] = [];

  loading = true;

  constructor(
    private adminUserService: AdminUserService,
    private hotelService: HotelService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    this.adminUserService.getUsers().subscribe(users => {
      this.users = users;
    });

    this.hotelService.getHotels().subscribe(hotels => {
      this.hotels = hotels;
    });

    this.eventService.getEvents().subscribe(events => {
      this.events = events;
      this.loading = false;
    });
  }

  get totalAdmins(): number {
    return this.users.filter(u => u.role === 'ADMIN').length;
  }

  get totalClients(): number {
    return this.users.filter(u => u.role === 'CLIENT').length;
  }

  get avgOccupancy(): number {
    if (!this.events.length) return 0;
    const rates = this.events.map(e =>
      e.capacity === 0 ? 0 : (e.attendees / e.capacity) * 100
    );
    const sum = rates.reduce((a, b) => a + b, 0);
    return Math.round(sum / rates.length);
  }
}
