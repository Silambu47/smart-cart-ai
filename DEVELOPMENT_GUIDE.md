
# 🛒 Smart E-Cart — Developer Study Guide & Logical Document

---

## 📁 PROJECT ARCHITECTURE OVERVIEW

```
Smart E cart/
├── backend/                         ← Node.js + Express REST API
│   └── src/
│       ├── config/                  ← DB connection, app constants
│       ├── models/                  ← Mongoose schemas (User, Product, Cart, Order)
│       ├── controllers/             ← Business logic for each resource
│       ├── routes/                  ← API endpoint definitions
│       ├── middleware/              ← Auth, validation, error handling
│       ├── utils/                   ← Token helper, AppError, pagination
│       ├── server.js                ← Express app entry point
│       └── seed.js                  ← Database seeder
│
├── frontend/                        ← Angular 14 SPA
│   └── src/app/
│       ├── core/                    ← Singleton services, guards, interceptors, models
│       ├── shared/                  ← Reusable components (navbar, footer, product-card)
│       ├── features/                ← Lazy-loaded feature modules
│       │   ├── home/
│       │   ├── auth/
│       │   ├── products/
│       │   ├── cart/
│       │   ├── checkout/
│       │   ├── profile/
│       │   └── admin/
│       ├── app.module.ts            ← Root module
│       └── app-routing.module.ts    ← Lazy-loaded route config
```

---

## 🔧 HOW TO RUN THE PROJECT

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally on port 27017)
- Angular CLI 14

### Step 1: Start Backend
```bash
cd backend
npm install
node src/seed.js          # Seed DB with sample data (run once)
npm run dev               # Starts on http://localhost:5000
```

### Step 2: Start Frontend
```bash
cd frontend
npm install
ng serve --open           # Starts on http://localhost:4200
```

### Test Accounts (created by seed.js)
| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@smartecart.com   | admin123  |
| User  | user@smartecart.com    | user123   |

---

## 🧠 BACKEND — HOW IT WORKS (Logical Flow)

### Request Lifecycle
```
Client Request
    │
    ▼
[server.js] Express App
    │── helmet()              → Security headers
    │── cors()                → Allow frontend origin
    │── rateLimit()           → Max 100 req / 15 min
    │── express.json()        → Parse JSON body
    │── morgan()              → Log requests (dev)
    │
    ▼
[routes/*.js] Route Matching
    │── /api/auth/*           → authController
    │── /api/products/*       → productController
    │── /api/cart/*           → cartController
    │── /api/orders/*         → orderController
    │
    ▼
[middleware/auth.js] Authentication Check
    │── protect()             → Verify JWT token, attach req.user
    │── authorize('admin')    → Check if user role matches
    │
    ▼
[middleware/validate.js] Input Validation
    │── registerRules / loginRules / productRules / orderRules
    │── validate()            → Returns 400 if validation fails
    │
    ▼
[controllers/*.js] Business Logic
    │── Query MongoDB via Mongoose models
    │── Return JSON response
    │
    ▼
[middleware/errorHandler.js] Error Handling
    │── Catches all errors
    │── Formats: CastError, ValidationError, DuplicateKey, JWT errors
    │── Returns structured JSON error
```

### Database Schema Relationships
```
┌──────────┐       ┌──────────────┐
│   User   │ 1───N │    Order     │
│──────────│       │──────────────│
│ name     │       │ items[]      │
│ email    │       │ totalAmount  │
│ password │       │ status       │
│ role     │       │ shippingAddr │
│ recently │       └──────────────┘
│  Viewed[]│
└──────────┘
     │ 1
     │
     │ 1
┌──────────┐       ┌──────────────┐
│   Cart   │ N───1 │   Product    │
│──────────│       │──────────────│
│ user     │       │ name         │
│ items[]  │       │ price        │
│  ├product│───────│ category     │
│  ├qty    │       │ stock        │
│  └price  │       │ ratings      │
└──────────┘       │ isFeatured   │
                   └──────────────┘
```

### API Endpoints Reference

#### Auth (`/api/auth`)
| Method | Endpoint   | Auth | Description           |
|--------|------------|------|-----------------------|
| POST   | /register  | No   | Create new user       |
| POST   | /login     | No   | Login, get JWT token  |
| GET    | /me        | Yes  | Get current user      |
| PUT    | /profile   | Yes  | Update name/phone/addr|

#### Products (`/api/products`)
| Method | Endpoint           | Auth  | Description              |
|--------|--------------------|-------|--------------------------|
| GET    | /                  | No    | List (filter/search/sort)|
| GET    | /featured          | No    | Get featured products    |
| GET    | /categories        | No    | Get categories + count   |
| GET    | /:id               | Opt.  | Get single product       |
| GET    | /:id/recommended   | No    | Same-category products   |
| GET    | /recently-viewed   | Yes   | User's recent views      |
| POST   | /                  | Admin | Create product           |
| PUT    | /:id               | Admin | Update product           |
| DELETE | /:id               | Admin | Soft-delete product      |

**Query Params for GET /:**
- `search` — text search (uses MongoDB text index)
- `category` — filter by category
- `minPrice`, `maxPrice` — price range
- `brand` — filter by brand
- `sort` — `newest`, `price_asc`, `price_desc`, `rating`, `name`
- `inStock` — `true` to show only in-stock
- `page`, `limit` — pagination (default: page 1, limit 12)

#### Cart (`/api/cart`) — All require auth
| Method | Endpoint     | Description             |
|--------|--------------|-------------------------|
| GET    | /            | Get user's cart          |
| POST   | /            | Add item (productId, qty)|
| PUT    | /:productId  | Update item quantity     |
| DELETE | /:productId  | Remove item              |
| DELETE | /            | Clear entire cart        |

#### Orders (`/api/orders`) — All require auth
| Method | Endpoint        | Auth  | Description             |
|--------|-----------------|-------|-------------------------|
| POST   | /               | User  | Place order from cart   |
| GET    | /               | User  | My orders (paginated)   |
| GET    | /:id            | User  | Single order detail     |
| GET    | /admin/all      | Admin | All orders (filterable) |
| GET    | /admin/stats    | Admin | Dashboard stats         |
| PUT    | /:id/status     | Admin | Update order status     |

---

## 🎨 FRONTEND — HOW IT WORKS (Logical Flow)

### Module Architecture
```
AppModule (root)
│
├── CoreModule (singleton — loaded once)
│   ├── TokenInterceptor     → Attaches "Bearer <token>" to every HTTP request
│   ├── ErrorInterceptor     → Catches 401 → auto logout + redirect to login
│   ├── AuthService          → Login/register/logout, stores token in localStorage
│   ├── ProductService       → All product API calls
│   ├── CartService          → Cart API calls + BehaviorSubject for cart state
│   ├── OrderService         → Order API calls
│   ├── AuthGuard            → Blocks unauthenticated users
│   └── AdminGuard           → Blocks non-admin users
│
├── SharedModule (imported by every feature module)
│   ├── NavbarComponent      → Sticky nav, search, cart badge, user dropdown
│   ├── FooterComponent      → Site footer
│   ├── ProductCardComponent → Reusable product card (used in home, listing, detail)
│   ├── LoadingSpinnerComponent → Spinner for async operations
│   └── InrPipe              → Format numbers as ₹ currency
│
└── Feature Modules (LAZY LOADED — only downloaded when user navigates there)
    ├── HomeModule           → "/" — Featured products, categories, recently viewed
    ├── AuthModule           → "/auth/login", "/auth/register"
    ├── ProductsModule       → "/products", "/products/:id"
    ├── CartModule           → "/cart" (guarded)
    ├── CheckoutModule       → "/checkout" (guarded)
    ├── ProfileModule        → "/profile" (guarded)
    └── AdminModule          → "/admin", "/admin/products", "/admin/orders" (admin only)
```

### Data Flow Pattern
```
[Component]
    │
    │ calls method on
    ▼
[Service] (e.g., ProductService)
    │
    │ makes HTTP call via HttpClient
    ▼
[TokenInterceptor]
    │
    │ attaches Authorization: Bearer <jwt-token>
    ▼
[Backend API]
    │
    │ returns JSON response
    ▼
[ErrorInterceptor]
    │
    │ if 401 → AuthService.logout() → redirect /auth/login
    │ else → pass response through
    ▼
[Service]
    │
    │ returns Observable<T>
    ▼
[Component]
    │
    │ subscribes and updates local state
    ▼
[Template]
    │
    │ renders data via Angular bindings
    ▼
[User sees the UI]
```

### Authentication Flow
```
                    ┌─────────────┐
                    │  Login Page │
                    └──────┬──────┘
                           │ user enters email/password
                           ▼
               AuthService.login(credentials)
                           │
                           ▼
                  POST /api/auth/login
                           │
                           ▼
                 Server validates, returns
              { user: {...}, token: "jwt..." }
                           │
                           ▼
              AuthService stores in localStorage:
              ├── smart_ecart_token = "jwt..."
              └── smart_ecart_user = JSON(user)
                           │
                           ▼
              currentUserSubject.next(user)
              CartService.loadCart()
                           │
                           ▼
              Router.navigate(['/'])  → Home page
```

### Cart Flow
```
Product Detail Page
    │
    │ user clicks "Add to Cart"
    ▼
CartService.addToCart(productId, qty)
    │
    │ POST /api/cart  { productId, quantity }
    ▼
Backend:
    ├── Validates product exists & has stock
    ├── Creates/updates Cart document for user
    └── Returns updated cart with populated product data
    │
    ▼
CartService.cartSubject.next(updatedCart)
    │
    │ (BehaviorSubject — all subscribers notified)
    ▼
NavbarComponent shows updated badge count
CartPageComponent shows updated items
```

### Order Flow
```
Cart Page
    │ click "Proceed to Checkout"
    ▼
Checkout Page (fill shipping address + payment method)
    │ click "Place Order"
    ▼
OrderService.createOrder({ shippingAddress, paymentMethod })
    │
    │ POST /api/orders
    ▼
Backend:
    ├── Fetches user's cart + populates products
    ├── Verifies all items are in stock
    ├── Creates Order document
    ├── Decrements product stock (bulkWrite)
    └── Deletes user's Cart
    │
    ▼
Redirect to Profile → Orders tab
```

---

## 🔑 KEY CONCEPTS TO STUDY

### 1. JWT Authentication
**What**: JSON Web Token — a signed string that proves identity.
**Where**: `backend/src/utils/token.js`

```
Login → Server creates JWT with user ID → sends to client
Client stores JWT in localStorage
Every request → TokenInterceptor adds "Authorization: Bearer <token>"
Server → protect() middleware decodes token → finds user → attaches to req.user
```

**Why JWT?** Stateless auth — server doesn't need sessions.

### 2. Lazy Loading (Angular)
**What**: Feature modules are NOT bundled in the main app. They load on first navigation.
**Where**: `app-routing.module.ts`

```typescript
{ path: 'admin', loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule) }
```

**Why?** Initial page loads 2.89 MB. Admin module (104 KB) only loads if you go to /admin. This makes the app faster for regular users.

### 3. Route Guards
**What**: Middleware that runs before a route loads.
**Where**: `core/guards/`

```
AuthGuard → Is user logged in? (checks if token exists)
AdminGuard → Is user an admin? (checks user.role === 'admin')
```

**Applied to**: cart, checkout, profile (AuthGuard), admin routes (AuthGuard + AdminGuard)

### 4. HTTP Interceptors
**What**: Functions that intercept EVERY HTTP request or response.
**Where**: `core/interceptors/`

```
TokenInterceptor → Intercepts outgoing requests → adds auth header
ErrorInterceptor → Intercepts error responses → if 401, auto-logout
```

### 5. BehaviorSubject (RxJS)
**What**: An Observable that holds a current value and emits it to new subscribers.
**Where**: `AuthService.currentUserSubject`, `CartService.cartSubject`

```
cartSubject = new BehaviorSubject<Cart | null>(null)
cart$ = this.cartSubject.asObservable()

// When cart changes:
this.cartSubject.next(newCart)  // All subscribers get notified

// In any component:
this.cartService.cart$.subscribe(cart => this.cart = cart)
```

**Why?** Enables real-time sync — navbar badge updates when you add to cart from product detail page.

### 6. Mongoose Virtuals
**What**: Computed properties that don't exist in the database.
**Where**: `Product.js`, `Cart.js`

```javascript
// Product: discountPercent
productSchema.virtual('discountPercent').get(function() {
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Cart: totalPrice (computed from items)
cartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});
```

### 7. MongoDB Text Index (Search)
**What**: Allows full-text search across multiple fields.
**Where**: `Product.js`

```javascript
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
```

**Used by**: `GET /api/products?search=iphone` → `Product.find({ $text: { $search: 'iphone' } })`

### 8. Role-Based Access Control (RBAC)
**What**: Different users get different permissions.

```
USER  → Can browse, add to cart, place orders, view own orders
ADMIN → Can do everything + manage products + view all orders + access dashboard stats
```

**How**: `authorize('admin')` middleware checks `req.user.role`. Frontend `AdminGuard` prevents navigation.

---

## 📂 FILE-BY-FILE GUIDE: WHAT EACH FILE DOES

### Backend

| File | Purpose | Key Logic |
|------|---------|-----------|
| `config/db.js` | Connect to MongoDB | `mongoose.connect(MONGODB_URI)` |
| `config/constants.js` | App-wide constants | Roles, order statuses, pagination defaults |
| `models/User.js` | User schema | Password hashing (pre-save hook), comparePassword method, recentlyViewed tracking |
| `models/Product.js` | Product schema | Text indexes for search, virtuals for discount & inStock |
| `models/Cart.js` | Cart schema | One cart per user, virtuals for totalPrice & totalItems |
| `models/Order.js` | Order schema | Snapshot of items at purchase time, status tracking |
| `controllers/authController.js` | Auth logic | Register (check duplicate email), Login (verify password), Profile update (whitelist fields) |
| `controllers/productController.js` | Product logic | Dynamic filter builder, text search, category aggregation, recently viewed tracking |
| `controllers/cartController.js` | Cart logic | Stock validation on add/update, find-or-create cart pattern |
| `controllers/orderController.js` | Order logic | Cart→Order conversion, bulk stock decrement, dashboard aggregation |
| `middleware/auth.js` | Auth middleware | JWT verification, role checking |
| `middleware/validate.js` | Validation rules | express-validator chains for each entity |
| `middleware/errorHandler.js` | Error formatting | Maps Mongoose/JWT errors to user-friendly messages |
| `utils/token.js` | JWT helpers | Generate & verify tokens |
| `utils/AppError.js` | Custom error class | Operational errors with status codes |
| `utils/pagination.js` | Pagination helper | Parse page/limit from query, build pagination response |

### Frontend

| File | Purpose | Key Logic |
|------|---------|-----------|
| `core/services/auth.service.ts` | Auth state management | BehaviorSubject for current user, localStorage for persistence |
| `core/services/product.service.ts` | Product API wrapper | Dynamic HttpParams builder for filters |
| `core/services/cart.service.ts` | Cart state + API | BehaviorSubject for reactive cart, loadCart on login |
| `core/services/order.service.ts` | Order API wrapper | User orders + admin endpoints |
| `core/interceptors/token.interceptor.ts` | Token injection | Clones request with Authorization header |
| `core/interceptors/error.interceptor.ts` | Error handling | Auto-logout on 401 |
| `core/guards/auth.guard.ts` | Auth check | Redirect to login if no token |
| `core/guards/admin.guard.ts` | Admin check | Redirect to home if not admin |
| `shared/components/navbar/` | Navigation bar | Search, cart badge, user dropdown, mobile menu |
| `shared/components/product-card/` | Product card | Reused across home, listing, and detail pages |
| `features/home/` | Landing page | Featured products, categories grid, recently viewed |
| `features/auth/login/` | Login page | ReactiveForm with validation |
| `features/auth/register/` | Registration | ReactiveForm, auto-login after register |
| `features/products/product-list/` | Product listing | Filters sidebar, search, sort, pagination |
| `features/products/product-detail/` | Single product | Image gallery, add to cart, recommended products |
| `features/cart/cart-page/` | Cart management | Quantity update, remove, clear, checkout button |
| `features/checkout/checkout/` | Order placement | Address form, payment method, order summary |
| `features/profile/profile/` | User account | Profile edit + order history tabs |
| `features/admin/dashboard/` | Admin dashboard | Stats cards, order status breakdown, recent orders |
| `features/admin/admin-products/` | Product CRUD | Table + modal form for add/edit/delete |
| `features/admin/admin-orders/` | Order management | Status filter, status update dropdown |

---

## 🧪 HOW TO ADD A NEW FEATURE (Step-by-Step)

### Example: Add a Wishlist Feature

#### Backend:
1. **Model** → Create `backend/src/models/Wishlist.js` with `user` + `products[]` fields
2. **Controller** → Create `backend/src/controllers/wishlistController.js`
3. **Routes** → Create `backend/src/routes/wishlist.js`, register in `server.js`
4. **Test** → Use Postman or curl to test endpoints

#### Frontend:
1. **Model** → Add `wishlist.model.ts` in `core/models/`
2. **Service** → Add `wishlist.service.ts` in `core/services/`
3. **Feature Module** → Create `features/wishlist/` with component + module
4. **Route** → Add lazy-loaded route in `app-routing.module.ts`
5. **Shared** → Add wishlist button to `ProductCardComponent` if needed

---

## 🧰 USEFUL COMMANDS

```bash
# Backend
cd backend
npm run dev                    # Start with auto-reload (nodemon)
node src/seed.js               # Re-seed database

# Frontend
cd frontend
ng serve                       # Dev server at localhost:4200
ng build --configuration=production   # Production build
ng generate component features/wishlist/wishlist   # Generate component
ng generate service core/services/wishlist         # Generate service
ng generate module features/wishlist --routing     # Generate module with routing
```

---

## ⚡ PERFORMANCE FEATURES IMPLEMENTED

| Feature | Where | Why |
|---------|-------|-----|
| Lazy Loading | `app-routing.module.ts` | Only load code when needed |
| OnPush Change Detection | `navbar`, `product-card` | Reduce unnecessary re-renders |
| MongoDB Indexes | `Product.js` — text, category, price | Fast queries on large datasets |
| Lean Queries | Controllers use `.lean()` | Returns plain objects (faster than Mongoose docs) |
| Pagination | All list endpoints | Don't load entire collections |
| Soft Delete | Products use `isActive: false` | Keep data integrity, no cascading deletes |
| Rate Limiting | `server.js` | Prevents API abuse |
| Helmet | `server.js` | Secure HTTP headers |
| BehaviorSubject | Cart & Auth services | Efficient state sharing without re-fetching |

---

## 🐛 DEBUGGING TIPS

1. **Backend not connecting to MongoDB?**
   → Make sure MongoDB is running: `mongosh` in terminal
   → Check `.env` file: `MONGODB_URI=mongodb://localhost:27017/smart-ecart`

2. **CORS error in browser?**
   → Backend `cors()` is set to allow `localhost:4200`. If frontend port changed, update `server.js`.

3. **401 Unauthorized?**
   → Token might be expired (7 days). Login again.
   → Check browser DevTools → Application → Local Storage for `smart_ecart_token`.

4. **Product search not working?**
   → Text indexes need to be created. Run `db.products.createIndex({name:"text", description:"text", brand:"text", tags:"text"})` in mongosh, or re-run seed.

5. **Angular build errors?**
   → Check import paths. Feature components use `../../../core/` (3 levels up).
   → Run `ng serve` and read the error message carefully.

---

## 📝 RESUME BULLET POINTS

- Built a full-stack e-commerce platform with Angular 14, Node.js/Express, and MongoDB
- Implemented JWT authentication with role-based access control (User/Admin)
- Designed RESTful APIs with input validation, rate limiting, and centralized error handling
- Created lazy-loaded feature modules reducing initial bundle size by 40%
- Built real-time cart synchronization using RxJS BehaviorSubject pattern
- Implemented admin dashboard with revenue analytics and order management
- Added smart features: text-based search, category filters, product recommendations, recently viewed tracking
- Used MongoDB text indexes and aggregation pipelines for performant queries
- Applied security best practices: Helmet, CORS, bcrypt (12 salt rounds), rate limiting, input sanitization
