import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3>🛒 Smart E-Cart</h3>
          <p>Your one-stop shop for everything you need. Quality products, great prices.</p>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <a routerLink="/">Home</a>
          <a routerLink="/products">Products</a>
          <a routerLink="/cart">Cart</a>
        </div>
        <div class="footer-section">
          <h4>Categories</h4>
          <a routerLink="/products" [queryParams]="{ category: 'Electronics' }">Electronics</a>
          <a routerLink="/products" [queryParams]="{ category: 'Clothing' }">Clothing</a>
          <a routerLink="/products" [queryParams]="{ category: 'Books' }">Books</a>
        </div>
        <div class="footer-section">
          <h4>Contact</h4>
          <p>📧 support&#64;smartecart.com</p>
          <p>📞 +91 98765 43210</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 Smart E-Cart. All rights reserved.</p>
      </div>
    </footer>
  `,
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {}
