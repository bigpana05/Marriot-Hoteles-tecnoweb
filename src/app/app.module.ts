import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

=======

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
import { HomeComponent } from './pages/client/home/home.component';
import { LoginComponent } from './pages/client/login/login.component';
import { ProfileComponent } from './pages/client/profile/profile.component';
import { CatalogComponent } from './pages/client/catalog/catalog.component';
import { CartComponent } from './pages/client/cart/cart.component';
<<<<<<< HEAD

import { ClientComponent } from './pages/client/client.component';

import { AdminComponent } from './pages/admin/admin.component';
import { HotelsComponent } from './pages/admin/hotels/hotels.component';
import { EventsComponent } from './pages/admin/events/events.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { UsersComponent } from './pages/admin/users/users.component';
=======
import { AdminComponent } from './pages/admin/admin.component';
import { ClientComponent } from './pages/client/client.component';
import { HotelsComponent } from './pages/admin/hotels/hotels.component';
import { EventsComponent } from './pages/admin/events/events.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51

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
<<<<<<< HEAD
    ClientComponent,
    AdminComponent,
    HotelsComponent,
    EventsComponent,
    DashboardComponent,
    UsersComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
=======
    AdminComponent,
    ClientComponent,
    HotelsComponent,
    EventsComponent,
    DashboardComponent
  ],
  imports: [HttpClientModule,
FormsModule,
    BrowserModule,
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
<<<<<<< HEAD
export class AppModule {}
=======
export class AppModule { }
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
