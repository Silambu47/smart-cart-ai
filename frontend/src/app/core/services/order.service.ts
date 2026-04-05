import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, DashboardStats } from '../models/order.model';
import { Pagination } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(orderData: {
    shippingAddress: any;
    paymentMethod: string;
  }): Observable<{ success: boolean; data: Order }> {
    return this.http.post<{ success: boolean; data: Order }>(this.apiUrl, orderData);
  }

  getMyOrders(
    page: number = 1,
    limit: number = 10
  ): Observable<{ success: boolean; data: Order[]; pagination: Pagination }> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<{ success: boolean; data: Order[]; pagination: Pagination }>(
      this.apiUrl,
      { params }
    );
  }

  getOrder(id: string): Observable<{ success: boolean; data: Order }> {
    return this.http.get<{ success: boolean; data: Order }>(`${this.apiUrl}/${id}`);
  }

  // Admin
  getAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<{ success: boolean; data: Order[]; pagination: Pagination }> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<{ success: boolean; data: Order[]; pagination: Pagination }>(
      `${this.apiUrl}/admin/all`,
      { params }
    );
  }

  updateOrderStatus(
    id: string,
    status: string
  ): Observable<{ success: boolean; data: Order }> {
    return this.http.put<{ success: boolean; data: Order }>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }

  getDashboardStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(
      `${this.apiUrl}/admin/stats`
    );
  }
}
