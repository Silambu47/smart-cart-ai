import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);

  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  get cartItemCount(): number {
    return this.cartSubject.value?.totalItems || 0;
  }

  loadCart(): void {
    this.http.get<{ success: boolean; data: Cart }>(`${this.apiUrl}`).subscribe({
      next: (res) => this.cartSubject.next(res.data),
      error: () => this.cartSubject.next(null),
    });
  }

  addToCart(
    productId: string,
    quantity: number = 1
  ): Observable<{ success: boolean; data: Cart }> {
    return this.http
      .post<{ success: boolean; data: Cart }>(this.apiUrl, { productId, quantity })
      .pipe(tap((res) => this.cartSubject.next(res.data)));
  }

  updateQuantity(
    productId: string,
    quantity: number
  ): Observable<{ success: boolean; data: Cart }> {
    return this.http
      .put<{ success: boolean; data: Cart }>(`${this.apiUrl}/${productId}`, { quantity })
      .pipe(tap((res) => this.cartSubject.next(res.data)));
  }

  removeFromCart(productId: string): Observable<{ success: boolean; data: Cart }> {
    return this.http
      .delete<{ success: boolean; data: Cart }>(`${this.apiUrl}/${productId}`)
      .pipe(tap((res) => this.cartSubject.next(res.data)));
  }

  clearCart(): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(this.apiUrl)
      .pipe(tap(() => this.cartSubject.next(null)));
  }

  resetCart(): void {
    this.cartSubject.next(null);
  }
}
