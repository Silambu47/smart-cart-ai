import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { Pagination } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss'],
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  pagination!: Pagination;
  loading = true;
  statusFilter = '';
  statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page = 1): void {
    this.loading = true;
    this.orderService.getAllOrders(page, 10, this.statusFilter || undefined).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.pagination = res.pagination;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  updateStatus(order: Order, newStatus: string): void {
    this.orderService.updateOrderStatus(order._id, newStatus).subscribe({
      next: (res) => {
        order.status = res.data.status;
      },
    });
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: '#ffc107',
      processing: '#2196f3',
      shipped: '#9c27b0',
      delivered: '#4caf50',
      cancelled: '#e94560',
    };
    return colors[status] || '#888';
  }

  getUserName(user: any): string {
    return typeof user === 'object' ? user?.name || 'N/A' : 'N/A';
  }
}
