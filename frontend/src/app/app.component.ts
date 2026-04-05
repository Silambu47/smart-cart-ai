import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private cartService: CartService) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.cartService.loadCart();
    }
  }
}
