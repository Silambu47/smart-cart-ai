import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { Cart, CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss'],
})
export class CartPageComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  updatingItems: Set<string> = new Set();

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
      this.loading = false;
    });
    this.cartService.loadCart();
  }

  updateQuantity(item: CartItem, delta: number): void {
    const newQty = item.quantity + delta;
    if (newQty < 1 || newQty > item.product.stock) return;

    this.updatingItems.add(item._id);
    this.cartService.updateQuantity(item.product._id, newQty).subscribe({
      next: () => this.updatingItems.delete(item._id),
      error: () => this.updatingItems.delete(item._id),
    });
  }

  removeItem(item: CartItem): void {
    this.updatingItems.add(item._id);
    this.cartService.removeFromCart(item.product._id).subscribe({
      next: () => this.updatingItems.delete(item._id),
      error: () => this.updatingItems.delete(item._id),
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe();
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }
}
