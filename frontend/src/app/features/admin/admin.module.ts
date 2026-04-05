import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminProductsComponent } from './admin-products/admin-products.component';
import { AdminOrdersComponent } from './admin-orders/admin-orders.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'products', component: AdminProductsComponent },
  { path: 'orders', component: AdminOrdersComponent },
];

@NgModule({
  declarations: [DashboardComponent, AdminProductsComponent, AdminOrdersComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
