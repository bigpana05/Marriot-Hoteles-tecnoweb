import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClientComponent } from './pages/client/client.component';
import { HomeComponent } from './pages/client/home/home.component';
import { LoginComponent } from './pages/client/login/login.component';
import { RegisterComponent } from './pages/client/register/register.component';
import { ProfileComponent } from './pages/client/profile/profile.component';
import { CatalogComponent } from './pages/client/catalog/catalog.component';
import { CartComponent } from './pages/client/cart/cart.component';
import { ExperiencesComponent } from './pages/client/experiences/experiences.component';
import { OffersComponent } from './pages/client/offers/offers.component';
import { SearchHotelsComponent } from './pages/client/search-hotels/search-hotels.component';
import { ReserveHotelsComponent } from './pages/client/reserve-hotels/reserve-hotels.component';
import { CompleteBookingComponent } from './pages/client/complete-booking/complete-booking.component';
import { AvailabilityCalendarComponent } from './pages/client/availability-calendar/availability-calendar.component';
import { BookingConfirmationComponent } from './pages/client/booking-confirmation/booking-confirmation.component';
import { MyReservationsComponent } from './pages/client/my-reservations/my-reservations.component';
import { GuestReservationsComponent } from './pages/client/guest-reservations/guest-reservations.component';
import { DigitalCheckinComponent } from './pages/client/digital-checkin/digital-checkin.component';
import { GroupSearchComponent } from './pages/client/group-search/group-search.component';
import { GroupRequestComponent } from './pages/client/group-request/group-request.component';
import { GroupConfirmationComponent } from './pages/client/group-confirmation/group-confirmation.component';
import { AdminCouponsComponent } from './pages/admin/coupons/coupons.component';
import { AdminComponent } from './pages/admin/admin.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { HotelsComponent } from './pages/admin/hotels/hotels.component';
import { EventsComponent } from './pages/admin/events/events.component';
import { UsersComponent } from './pages/admin/users/users.component';
import { AdminBookingsComponent } from './pages/admin/bookings/bookings.component';
import { AdminRoomsComponent } from './pages/admin/rooms/admin-rooms/admin-rooms.component';
import { AdminRoomOccupancyComponent } from './pages/admin/rooms/admin-room-occupancy/admin-room-occupancy.component';
import { GroupHotelsComponent } from './pages/admin/group-hotels/group-hotels.component';
import { GroupRequestsComponent } from './pages/admin/group-requests/group-requests.component';

import { AboutComponent } from './pages/about/about.component';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { GuestGuard } from './core/guards/guest.guard';

import { NotFoundComponent } from './shared/not-found/not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'client', pathMatch: 'full' },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'hotels', component: HotelsComponent },
      { path: 'events', component: EventsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'bookings', component: AdminBookingsComponent },
      { path: 'rooms', component: AdminRoomsComponent },
      { path: 'room-occupancy', component: AdminRoomOccupancyComponent },
      { path: 'group-hotels', component: GroupHotelsComponent },
      { path: 'group-requests', component: GroupRequestsComponent },

      // --- NUEVA RUTA AQUÍ ---
      { path: 'coupons', component: AdminCouponsComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  {
    path: 'client',
    component: ClientComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [GuestGuard],
      },
      { path: 'profile', component: ProfileComponent },
      { path: 'catalog', component: CatalogComponent },
      { path: 'cart', component: CartComponent },
      { path: 'experiences', component: ExperiencesComponent },
      { path: 'offers', component: OffersComponent },
      { path: 'search-hotels', component: SearchHotelsComponent },
      {
        path: 'hotel/:id/availability',
        component: AvailabilityCalendarComponent,
      },
      { path: 'hotel/:id/rooms', component: ReserveHotelsComponent },
      { path: 'hotel/:id/booking', component: CompleteBookingComponent },
      {
        path: 'booking-confirmation/:code',
        component: BookingConfirmationComponent,
      },
      {
        path: 'my-reservations',
        component: MyReservationsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'check-in/:confirmationCode',
        component: DigitalCheckinComponent,
      },
      { path: 'guest-reservations', component: GuestReservationsComponent },
      { path: 'groups', component: GroupSearchComponent },
      { path: 'groups/request/:id', component: GroupRequestComponent },
      {
        path: 'groups/confirmation/:code',
        component: GroupConfirmationComponent,
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'hotels', component: HotelsComponent },
      { path: 'events', component: EventsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'bookings', component: AdminBookingsComponent },
      { path: 'rooms', component: AdminRoomsComponent },
      { path: 'room-occupancy', component: AdminRoomOccupancyComponent },
      { path: 'group-hotels', component: GroupHotelsComponent },
      { path: 'group-requests', component: GroupRequestsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: 'about', component: AboutComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
