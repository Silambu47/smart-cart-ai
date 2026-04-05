export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  images: string[];
  stock: number;
  ratings: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  discountPercent?: number;
  inStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sort?: string;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface Category {
  name: string;
  count: number;
}
