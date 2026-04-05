import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CartPageComponent } from './cart-page/cart-page.component';

const routes: Routes = [{ path: '', component: CartPageComponent }];

@NgModule({
  declarations: [CartPageComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class CartModule {}
