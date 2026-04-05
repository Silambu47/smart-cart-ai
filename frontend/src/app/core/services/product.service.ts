import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Product,
  ProductsResponse,
  ProductFilters,
  Category,
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(filters: ProductFilters = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<ProductsResponse>(this.apiUrl, { params });
  }

  getProduct(id: string): Observable<{ success: boolean; data: Product }> {
    return this.http.get<{ success: boolean; data: Product }>(`${this.apiUrl}/${id}`);
  }

  getFeaturedProducts(): Observable<{ success: boolean; data: Product[] }> {
    return this.http.get<{ success: boolean; data: Product[] }>(`${this.apiUrl}/featured`);
  }

  getCategories(): Observable<{ success: boolean; data: Category[] }> {
    return this.http.get<{ success: boolean; data: Category[] }>(`${this.apiUrl}/categories`);
  }

  getRecommended(id: string): Observable<{ success: boolean; data: Product[] }> {
    return this.http.get<{ success: boolean; data: Product[] }>(
      `${this.apiUrl}/${id}/recommended`
    );
  }

  getRecentlyViewed(): Observable<{ success: boolean; data: Product[] }> {
    return this.http.get<{ success: boolean; data: Product[] }>(
      `${this.apiUrl}/recently-viewed`
    );
  }

  // Admin
  createProduct(product: Partial<Product>): Observable<{ success: boolean; data: Product }> {
    return this.http.post<{ success: boolean; data: Product }>(this.apiUrl, product);
  }

  updateProduct(
    id: string,
    product: Partial<Product>
  ): Observable<{ success: boolean; data: Product }> {
    return this.http.put<{ success: boolean; data: Product }>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
