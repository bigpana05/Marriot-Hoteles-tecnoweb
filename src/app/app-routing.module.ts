import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/client/home/home.component';
import { LoginComponent } from './pages/client/login/login.component';
import { ProfileComponent } from './pages/client/profile/profile.component';
import { CatalogComponent } from './pages/client/catalog/catalog.component';
import { CartComponent } from './pages/client/cart/cart.component';
import { AdminComponent } from './pages/admin/admin.component';

const routes: Routes = [
<<<<<<< HEAD
  { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'catalog', loadChildren: () => import('./features/catalog/catalog.module').then(m => m.CatalogModule) },
  { path: 'cart', loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule) },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule) },
  { path: '**',
    loadComponent: () =>
      import('./shared/not-found/not-found.component').then(c => c.NotFoundComponent)
  }
=======
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'cart', component: CartComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' } // ruta por defecto
>>>>>>> feature/setup-structure
];

@NgModule({
  
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  
 }

