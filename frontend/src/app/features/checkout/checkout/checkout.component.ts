import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Cart } from '../../../core/models/cart.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cart: Cart | null = null;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.currentUser;
    this.checkoutForm = this.fb.group({
      street: [user?.address?.street || '', Validators.required],
      city: [user?.address?.city || '', Validators.required],
      state: [user?.address?.state || '', Validators.required],
      zipCode: [user?.address?.zipCode || '', Validators.required],
      country: [user?.address?.country || 'India'],
      paymentMethod: ['cod', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
      if (!cart || cart.items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
    this.cartService.loadCart();
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) return;
    this.loading = true;
    this.error = '';

    const formValue = this.checkoutForm.value;
    const orderData = {
      shippingAddress: {
        street: formValue.street,
        city: formValue.city,
        state: formValue.state,
        zipCode: formValue.zipCode,
        country: formValue.country,
      },
      paymentMethod: formValue.paymentMethod,
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/profile'], { queryParams: { tab: 'orders' } });
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      },
    });
  }
}
