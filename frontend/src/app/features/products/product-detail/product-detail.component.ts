import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  product!: Product;
  recommended: Product[] = [];
  loading = true;
  quantity = 1;
  addingToCart = false;
  addedMessage = '';
  selectedImage = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.loadProduct(params['id']);
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (res) => {
        this.product = res.data;
        this.selectedImage = this.product.images?.[0] || '';
        this.loading = false;
        this.loadRecommended(id);
      },
      error: () => (this.loading = false),
    });
  }

  loadRecommended(id: string): void {
    this.productService.getRecommended(id).subscribe({
      next: (res) => (this.recommended = res.data),
    });
  }

  get discountPercent(): number {
    if (this.product?.originalPrice && this.product.originalPrice > this.product.price) {
      return Math.round(
        ((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100
      );
    }
    return 0;
  }

  changeQuantity(delta: number): void {
    const newQty = this.quantity + delta;
    if (newQty >= 1 && newQty <= this.product.stock) {
      this.quantity = newQty;
    }
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn) return;
    this.addingToCart = true;
    this.cartService.addToCart(this.product._id, this.quantity).subscribe({
      next: () => {
        this.addingToCart = false;
        this.addedMessage = 'Added to cart!';
        setTimeout(() => (this.addedMessage = ''), 3000);
      },
      error: () => (this.addingToCart = false),
    });
  }
}
