import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminHomeComponent } from './pages/admin-home.component';

@NgModule({
  declarations: [AdminComponent, AdminHomeComponent],
  imports: [CommonModule, AdminRoutingModule],
})
export class AdminModule {}
