import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() product!: Product;

  get discountPercent(): number {
    if (this.product.originalPrice && this.product.originalPrice > this.product.price) {
      return Math.round(
        ((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100
      );
    }
    return 0;
  }

  get displayImage(): string {
    return this.product.images?.[0] || 'https://placehold.co/300x300?text=No+Image';
  }
}
