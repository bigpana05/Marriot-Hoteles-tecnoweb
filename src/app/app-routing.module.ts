import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './pages/admin/admin.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { HotelsComponent } from './pages/admin/hotels/hotels.component';
import { EventsComponent } from './pages/admin/events/events.component';
import { UsersComponent } from './pages/admin/users/users.component';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

import { NotFoundComponent } from './shared/not-found/not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'client', pathMatch: 'full' },

  {
    path: 'client',
    loadChildren: () =>
      import('./features/client/client.module').then((m) => m.ClientModule),
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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
