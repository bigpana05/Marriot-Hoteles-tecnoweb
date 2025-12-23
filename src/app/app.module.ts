import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './pages/client/home/home.component';
import { LoginComponent } from './pages/client/login/login.component';
import { RegisterComponent } from './pages/client/register/register.component';
import { ProfileComponent } from './pages/client/profile/profile.component';
import { CatalogComponent } from './pages/client/catalog/catalog.component';
import { CartComponent } from './pages/client/cart/cart.component';

import { ClientComponent } from './pages/client/client.component';

import { AdminComponent } from './pages/admin/admin.component';
import { HotelsComponent } from './pages/admin/hotels/hotels.component';
import { EventsComponent } from './pages/admin/events/events.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { UsersComponent } from './pages/admin/users/users.component';
import { HeroSectionComponent } from './pages/client/home/sections/hero-section/hero-section.component';
import { ExperiencesComponent } from './pages/client/experiences/experiences.component';
import { OffersComponent } from './pages/client/offers/offers.component';
import { AboutComponent } from './pages/about/about.component';
import { SearchSectionComponent } from './pages/client/home/sections/search-section/search-section.component';
import { DestinationDropdownComponent } from './pages/client/home/sections/search-section/destination-dropdown/destination-dropdown.component';
import { DatePickerDropdownComponent } from './pages/client/home/sections/search-section/date-picker-dropdown/date-picker-dropdown.component';
import { RoomsSelectorComponent } from './pages/client/home/sections/search-section/rooms-selector/rooms-selector.component';
import { HotelsCarouselComponent } from './pages/client/home/sections/search-section/hotels-carousel/hotels-carousel.component';
import { HomeOffersExclusiveComponent } from './pages/client/home/sections/home-offers-exclusive/home-offers-exclusive.component';
import { HomeJoinMarriottComponent } from './pages/client/home/sections/home-join-marriott/home-join-marriott.component';
import { HomeFeaturedHotelsComponent } from './pages/client/home/sections/home-featured-hotels/home-featured-hotels.component';
import { HomeExperiencesAmenitiesComponent } from './pages/client/home/sections/home-experiences-amenities/home-experiences-amenities.component';
import { HomeInspirationComponent } from './pages/client/home/sections/home-inspiration/home-inspiration.component';
import { SearchHotelsComponent } from './pages/client/search-hotels/search-hotels.component';
import { HotelResultCardComponent } from './pages/client/search-hotels/hotel-result-card/hotel-result-card.component';
import { ReserveHotelsComponent } from './pages/client/reserve-hotels/reserve-hotels.component';
import { CompleteBookingComponent } from './pages/client/complete-booking/complete-booking.component';
import { AvailabilityCalendarComponent } from './pages/client/availability-calendar/availability-calendar.component';
import { BookingConfirmationComponent } from './pages/client/booking-confirmation/booking-confirmation.component';
import { MyReservationsComponent } from './pages/client/my-reservations/my-reservations.component';
import { GuestReservationsComponent } from './pages/client/guest-reservations/guest-reservations.component';
import { AdminBookingsComponent } from './pages/admin/bookings/bookings.component';
import { RoomDetailsModalComponent } from './pages/client/reserve-hotels/room-details-modal/room-details-modal.component';
import { AdminRoomsComponent } from './pages/admin/rooms/admin-rooms/admin-rooms.component';
import { AdminRoomOccupancyComponent } from './pages/admin/rooms/admin-room-occupancy/admin-room-occupancy.component';
import { HotelCardComponent } from './pages/client/catalog/hotel-card/hotel-card.component';
import { DigitalCheckinComponent } from './pages/client/digital-checkin/digital-checkin.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    CatalogComponent,
    CartComponent,
    ClientComponent,
    AdminComponent,
    HotelsComponent,
    EventsComponent,
    DashboardComponent,
    UsersComponent,
    HeroSectionComponent,
    ExperiencesComponent,
    OffersComponent,
    AboutComponent,
    SearchSectionComponent,
    DestinationDropdownComponent,
    DatePickerDropdownComponent,
    RoomsSelectorComponent,
    HotelsCarouselComponent,
    HomeOffersExclusiveComponent,
    HomeJoinMarriottComponent,
    HomeFeaturedHotelsComponent,
    HomeExperiencesAmenitiesComponent,
    HomeInspirationComponent,
    SearchHotelsComponent,
    HotelResultCardComponent,
    ReserveHotelsComponent,
    CompleteBookingComponent,
    AvailabilityCalendarComponent,
    BookingConfirmationComponent,
    MyReservationsComponent,
    GuestReservationsComponent,

    AdminBookingsComponent,
    RoomDetailsModalComponent,
    AdminRoomsComponent,
    AdminRoomOccupancyComponent,
    HotelCardComponent,
    DigitalCheckinComponent,
  ],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, HttpClientModule, AppRoutingModule],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  bootstrap: [AppComponent],
})
export class AppModule { }
