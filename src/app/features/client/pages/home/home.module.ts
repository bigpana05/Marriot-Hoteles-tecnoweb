import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { HeroSectionComponent } from './sections/hero-section/hero-section.component';

@NgModule({
  declarations: [HomeComponent, HeroSectionComponent],
  imports: [CommonModule, HomeRoutingModule],
})
export class HomeModule {}
