import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { User } from '../../../core/models/user.model';
import { Order } from '../../../core/models/order.model';
import { Pagination } from '../../../core/models/product.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  activeTab: 'profile' | 'orders' = 'profile';
  user: User | null = null;
  profileForm!: FormGroup;
  orders: Order[] = [];
  pagination!: Pagination;
  loading = false;
  saving = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    this.initForm();
    this.loadOrders();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      name: [this.user?.name || '', Validators.required],
      phone: [this.user?.phone || ''],
      street: [this.user?.address?.street || ''],
      city: [this.user?.address?.city || ''],
      state: [this.user?.address?.state || ''],
      zipCode: [this.user?.address?.zipCode || ''],
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.saving = true;
    const val = this.profileForm.value;

    this.authService
      .updateProfile({
        name: val.name,
        phone: val.phone,
        address: {
          street: val.street,
          city: val.city,
          state: val.state,
          zipCode: val.zipCode,
          country: 'India',
        },
      } as any)
      .subscribe({
        next: () => {
          this.saving = false;
          this.successMessage = 'Profile updated!';
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: () => (this.saving = false),
      });
  }

  loadOrders(page = 1): void {
    this.loading = true;
    this.orderService.getMyOrders(page).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.pagination = res.pagination;
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
