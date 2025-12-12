import { NgModule, LOCALE_ID } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeEs);
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './pages/client/home/home.component';
import { LoginComponent } from './pages/client/login/login.component';
import { ProfileComponent } from './pages/client/profile/profile.component';
import { CatalogComponent } from './pages/client/catalog/catalog.component';
import { CartComponent } from './pages/client/cart/cart.component';
import { ClientComponent } from './pages/client/client.component';
import { ExperiencesComponent } from './pages/client/experiences/experiences.component';

import { AdminComponent } from './pages/admin/admin.component';
import { HotelsComponent } from './pages/admin/hotels/hotels.component';
import { EventsComponent } from './pages/admin/events/events.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { UsersComponent } from './pages/admin/users/users.component';
import { HeroSectionComponent } from './pages/client/home/sections/hero-section/hero-section.component';
import { OffersComponent } from './pages/client/offers/offers.component';
import { AboutComponent } from './pages/about/about.component';
import { SearchSectionComponent } from './pages/client/home/sections/search-section/search-section.component';
import { DestinationDropdownComponent } from './pages/client/home/sections/search-section/destination-dropdown/destination-dropdown.component';
import { DatePickerDropdownComponent } from './pages/client/home/sections/search-section/date-picker-dropdown/date-picker-dropdown.component';
import { RoomsSelectorComponent } from './pages/client/home/sections/search-section/rooms-selector/rooms-selector.component';
import { HotelsCarouselComponent } from './pages/client/home/sections/search-section/hotels-carousel/hotels-carousel.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    ProfileComponent,
    CatalogComponent,
    CartComponent,
    ClientComponent,
    AdminComponent,
    HotelsComponent,
    ExperiencesComponent,
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
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
