import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { DashboardStats } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats!: DashboardStats;
  loading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false),
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
}
