import { Address } from './user.model';

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  _id: string;
  user: string | { name: string; email: string };
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'cod' | 'card' | 'upi';
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  ordersByStatus: { status: string; count: number }[];
  recentOrders: Order[];
}
