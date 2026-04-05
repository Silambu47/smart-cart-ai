import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product, Pagination } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss'],
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  pagination!: Pagination;
  loading = true;
  showForm = false;
  editing = false;
  editId = '';
  saving = false;
  productForm!: FormGroup;

  categories = [
    'Electronics', 'Clothing', 'Books', 'Home & Kitchen',
    'Sports', 'Beauty', 'Toys', 'Groceries', 'Other',
  ];

  constructor(private productService: ProductService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      originalPrice: [0],
      category: ['Electronics', Validators.required],
      brand: [''],
      stock: [0, [Validators.required, Validators.min(0)]],
      isFeatured: [false],
      images: [''],
      tags: [''],
    });
  }

  loadProducts(page = 1): void {
    this.loading = true;
    this.productService.getProducts({ page, limit: 10 }).subscribe({
      next: (res) => {
        this.products = res.data;
        this.pagination = res.pagination;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openAddForm(): void {
    this.initForm();
    this.editing = false;
    this.showForm = true;
  }

  openEditForm(product: Product): void {
    this.editing = true;
    this.editId = product._id;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      brand: product.brand || '',
      stock: product.stock,
      isFeatured: product.isFeatured,
      images: product.images?.join(', ') || '',
      tags: product.tags?.join(', ') || '',
    });
    this.showForm = true;
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;
    this.saving = true;

    const val = this.productForm.value;
    const productData: any = {
      ...val,
      images: val.images ? val.images.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      tags: val.tags ? val.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    };

    const req$ = this.editing
      ? this.productService.updateProduct(this.editId, productData)
      : this.productService.createProduct(productData);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.loadProducts();
      },
      error: () => (this.saving = false),
    });
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Delete "${product.name}"?`)) return;
    this.productService.deleteProduct(product._id).subscribe({
      next: () => this.loadProducts(),
    });
  }

  cancelForm(): void {
    this.showForm = false;
  }
}
