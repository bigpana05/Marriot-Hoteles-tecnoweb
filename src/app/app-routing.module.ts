import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClientComponent } from './pages/client/client.component';
import { HomeComponent } from './pages/client/home/home.component';
import { LoginComponent } from './pages/client/login/login.component';
import { ProfileComponent } from './pages/client/profile/profile.component';
import { CatalogComponent } from './pages/client/catalog/catalog.component';
import { CartComponent } from './pages/client/cart/cart.component';
import { ExperiencesComponent } from './pages/client/experiences/experiences.component';
import { OffersComponent } from './pages/client/offers/offers.component';

import { AdminComponent } from './pages/admin/admin.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { HotelsComponent } from './pages/admin/hotels/hotels.component';
import { EventsComponent } from './pages/admin/events/events.component';
import { UsersComponent } from './pages/admin/users/users.component';

import { AboutComponent } from './pages/about/about.component';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

import { NotFoundComponent } from './shared/not-found/not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'client', pathMatch: 'full' },

  {
    path: 'client',
    component: ClientComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'catalog', component: CatalogComponent },
      { path: 'cart', component: CartComponent },
      { path: 'experiences', component: ExperiencesComponent },
      { path: 'offers', component: OffersComponent },
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
