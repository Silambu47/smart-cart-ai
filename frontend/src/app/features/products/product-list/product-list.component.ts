import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product, Pagination, ProductFilters, Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  pagination!: Pagination;
  loading = true;
  filtersOpen = false;

  filters: ProductFilters = {
    page: 1,
    limit: 12,
    search: '',
    category: '',
    sort: 'newest',
    minPrice: undefined,
    maxPrice: undefined,
  };

  sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'name', label: 'Name A-Z' },
  ];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: (res) => (this.categories = res.data),
    });

    this.route.queryParams.subscribe((params) => {
      this.filters = {
        ...this.filters,
        search: params['search'] || '',
        category: params['category'] || '',
        page: Number(params['page']) || 1,
        sort: params['sort'] || 'newest',
      };
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.filters).subscribe({
      next: (res) => {
        this.products = res.data;
        this.pagination = res.pagination;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  applyFilters(): void {
    this.filters.page = 1;
    this.updateUrl();
  }

  clearFilters(): void {
    this.filters = { page: 1, limit: 12, search: '', category: '', sort: 'newest' };
    this.updateUrl();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.updateUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateUrl(): void {
    const queryParams: any = {};
    if (this.filters.search) queryParams.search = this.filters.search;
    if (this.filters.category) queryParams.category = this.filters.category;
    if (this.filters.sort && this.filters.sort !== 'newest') queryParams.sort = this.filters.sort;
    if (this.filters.page && this.filters.page > 1) queryParams.page = this.filters.page;
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  get pages(): number[] {
    if (!this.pagination) return [];
    const arr = [];
    for (let i = 1; i <= this.pagination.totalPages; i++) {
      arr.push(i);
    }
    return arr;
  }
}
