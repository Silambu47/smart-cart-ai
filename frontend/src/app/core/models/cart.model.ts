export interface CartItem {
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    stock: number;
  };
  quantity: number;
  price: number;
  _id: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}
