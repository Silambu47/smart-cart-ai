import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { InrPipe } from './pipes/inr.pipe';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    ProductCardComponent,
    LoadingSpinnerComponent,
    InrPipe,
  ],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
    ProductCardComponent,
    LoadingSpinnerComponent,
    InrPipe,
  ],
})
export class SharedModule {}
