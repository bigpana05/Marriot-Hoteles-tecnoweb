import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
<<<<<<< HEAD

=======
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
import { HomeComponent } from './pages/client/home/home.component';
import { LoginComponent } from './pages/client/login/login.component';
import { ProfileComponent } from './pages/client/profile/profile.component';
import { CatalogComponent } from './pages/client/catalog/catalog.component';
import { CartComponent } from './pages/client/cart/cart.component';
<<<<<<< HEAD

import { ClientComponent } from './pages/client/client.component';

=======
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
import { AdminComponent } from './pages/admin/admin.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { HotelsComponent } from './pages/admin/hotels/hotels.component';
import { EventsComponent } from './pages/admin/events/events.component';
<<<<<<< HEAD
import { UsersComponent } from './pages/admin/users/users.component';

import { AuthGuard } from './src/app/core/services/auth.guard';
import { RoleGuard } from './src/app/core/services/role.guard';

=======
import { ClientComponent } from './pages/client/client.component';

// app-routing.module.ts
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
const routes: Routes = [
  { path: '', redirectTo: 'client/home', pathMatch: 'full' },

  {
    path: 'client',
    component: ClientComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
<<<<<<< HEAD
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'CLIENT' }
      },
      { path: 'catalog', component: CatalogComponent },
      {
        path: 'cart',
        component: CartComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'CLIENT' }
      },
=======
      { path: 'profile', component: ProfileComponent },
      { path: 'catalog', component: CatalogComponent },
      { path: 'cart', component: CartComponent },
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  {
    path: 'admin',
    component: AdminComponent,
<<<<<<< HEAD
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
=======
    children: [
      { path: 'dashboard', component: DashboardComponent },
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
      { path: 'hotels', component: HotelsComponent },
      { path: 'events', component: EventsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'client/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
<<<<<<< HEAD
export class AppRoutingModule {}
=======
export class AppRoutingModule { }
>>>>>>> 7675a6e8aced24013f1797fd54ecc203a5246a51
