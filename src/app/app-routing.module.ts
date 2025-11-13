import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/client/home/home.component';
import { LoginComponent } from './pages/client/login/login.component';
import { ProfileComponent } from './pages/client/profile/profile.component';
import { CatalogComponent } from './pages/client/catalog/catalog.component';
import { CartComponent } from './pages/client/cart/cart.component';

import { ClientComponent } from './pages/client/client.component';

import { AdminComponent } from './pages/admin/admin.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { HotelsComponent } from './pages/admin/hotels/hotels.component';
import { EventsComponent } from './pages/admin/events/events.component';
import { UsersComponent } from './pages/admin/users/users.component';

import { AuthGuard } from './src/app/core/services/auth.guard';
import { RoleGuard } from './src/app/core/services/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'client/home', pathMatch: 'full' },

  {
    path: 'client',
    component: ClientComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
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
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
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
export class AppRoutingModule {}
