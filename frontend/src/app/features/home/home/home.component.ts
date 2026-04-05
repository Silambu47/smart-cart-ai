import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  recentlyViewed: Product[] = [];
  categories: Category[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.productService.getFeaturedProducts().subscribe({
      next: (res) => {
        this.featuredProducts = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });

    this.productService.getCategories().subscribe({
      next: (res) => (this.categories = res.data),
    });

    if (this.authService.isLoggedIn) {
      this.productService.getRecentlyViewed().subscribe({
        next: (res) => (this.recentlyViewed = res.data),
      });
    }
  }
}
