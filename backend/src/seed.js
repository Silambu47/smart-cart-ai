const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

const products = [
  {
    name: 'iPhone 15 Pro Max',
    description: 'Apple iPhone 15 Pro Max with A17 Pro chip, 256GB storage, and titanium design.',
    price: 134900,
    originalPrice: 159900,
    category: 'Electronics',
    brand: 'Apple',
    images: ['https://placehold.co/400x400?text=iPhone+15'],
    stock: 25,
    ratings: { average: 4.8, count: 342 },
    isFeatured: true,
    tags: ['smartphone', 'apple', 'iphone', '5g'],
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Samsung Galaxy S24 Ultra with Snapdragon 8 Gen 3, 200MP camera, S-Pen included.',
    price: 129999,
    originalPrice: 144999,
    category: 'Electronics',
    brand: 'Samsung',
    images: ['https://placehold.co/400x400?text=Galaxy+S24'],
    stock: 30,
    ratings: { average: 4.6, count: 256 },
    isFeatured: true,
    tags: ['smartphone', 'samsung', 'galaxy', '5g'],
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise cancelling headphones with exceptional sound quality.',
    price: 24990,
    originalPrice: 34990,
    category: 'Electronics',
    brand: 'Sony',
    images: ['https://placehold.co/400x400?text=Sony+XM5'],
    stock: 50,
    ratings: { average: 4.7, count: 1200 },
    isFeatured: true,
    tags: ['headphones', 'sony', 'noise-cancelling', 'wireless'],
  },
  {
    name: 'Nike Air Max 270',
    description: 'Men running shoes with Air Max cushioning for unbeatable comfort.',
    price: 8995,
    originalPrice: 12995,
    category: 'Clothing',
    brand: 'Nike',
    images: ['https://placehold.co/400x400?text=Nike+Air+Max'],
    stock: 100,
    ratings: { average: 4.4, count: 890 },
    isFeatured: true,
    tags: ['shoes', 'nike', 'running', 'sports'],
  },
  {
    name: 'Atomic Habits by James Clear',
    description: 'An easy & proven way to build good habits & break bad ones. #1 New York Times bestseller.',
    price: 399,
    originalPrice: 799,
    category: 'Books',
    brand: 'Penguin',
    images: ['https://placehold.co/400x400?text=Atomic+Habits'],
    stock: 200,
    ratings: { average: 4.9, count: 5000 },
    isFeatured: true,
    tags: ['book', 'self-help', 'habits', 'bestseller'],
  },
  {
    name: 'MacBook Air M3',
    description: 'Apple MacBook Air with M3 chip, 15-inch Liquid Retina display, 16GB RAM.',
    price: 139900,
    originalPrice: 149900,
    category: 'Electronics',
    brand: 'Apple',
    images: ['https://placehold.co/400x400?text=MacBook+Air'],
    stock: 15,
    ratings: { average: 4.7, count: 156 },
    isFeatured: true,
    tags: ['laptop', 'apple', 'macbook'],
  },
  {
    name: 'Prestige Iris 750W Mixer Grinder',
    description: '3 stainless steel jars mixer grinder with powerful 750W motor.',
    price: 2999,
    originalPrice: 4999,
    category: 'Home & Kitchen',
    brand: 'Prestige',
    images: ['https://placehold.co/400x400?text=Mixer+Grinder'],
    stock: 80,
    ratings: { average: 4.2, count: 340 },
    isFeatured: false,
    tags: ['mixer', 'kitchen', 'appliance'],
  },
  {
    name: 'Adidas Ultraboost Light',
    description: 'Ultraboost Light running shoes with BOOST midsole and Continental rubber outsole.',
    price: 11999,
    originalPrice: 16999,
    category: 'Clothing',
    brand: 'Adidas',
    images: ['https://placehold.co/400x400?text=Adidas+Ultraboost'],
    stock: 60,
    ratings: { average: 4.5, count: 670 },
    isFeatured: false,
    tags: ['shoes', 'adidas', 'running'],
  },
  {
    name: 'LEGO Technic Bugatti Chiron',
    description: 'Build your own Bugatti Chiron with this 3,599-piece LEGO Technic set.',
    price: 34999,
    originalPrice: 39999,
    category: 'Toys',
    brand: 'LEGO',
    images: ['https://placehold.co/400x400?text=LEGO+Bugatti'],
    stock: 10,
    ratings: { average: 4.9, count: 120 },
    isFeatured: true,
    tags: ['lego', 'toys', 'building', 'bugatti'],
  },
  {
    name: 'Yoga Mat Premium 6mm',
    description: 'Non-slip premium yoga mat with alignment lines, extra thick 6mm cushioning.',
    price: 1299,
    originalPrice: 2499,
    category: 'Sports',
    brand: 'Boldfit',
    images: ['https://placehold.co/400x400?text=Yoga+Mat'],
    stock: 150,
    ratings: { average: 4.3, count: 450 },
    isFeatured: false,
    tags: ['yoga', 'fitness', 'mat', 'exercise'],
  },
  {
    name: 'Lakme Absolute Skin Dew Serum Foundation',
    description: 'Lightweight serum foundation with hyaluronic acid for a dewy, natural finish.',
    price: 799,
    originalPrice: 999,
    category: 'Beauty',
    brand: 'Lakme',
    images: ['https://placehold.co/400x400?text=Lakme+Foundation'],
    stock: 120,
    ratings: { average: 4.1, count: 890 },
    isFeatured: false,
    tags: ['beauty', 'makeup', 'foundation', 'skincare'],
  },
  {
    name: 'Tata Sampann Unpolished Toor Dal',
    description: 'Rich in protein, unpolished premium toor dal, 1kg pack.',
    price: 159,
    originalPrice: 199,
    category: 'Groceries',
    brand: 'Tata',
    images: ['https://placehold.co/400x400?text=Toor+Dal'],
    stock: 500,
    ratings: { average: 4.4, count: 1200 },
    isFeatured: false,
    tags: ['groceries', 'dal', 'protein', 'food'],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    console.log('Cleared products');

    // Insert products
    await Product.insertMany(products);
    console.log(`Inserted ${products.length} products`);

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@smartecart.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@smartecart.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Admin user created (admin@smartecart.com / admin123)');
    }

    // Create test user if not exists
    const userExists = await User.findOne({ email: 'user@smartecart.com' });
    if (!userExists) {
      await User.create({
        name: 'Test User',
        email: 'user@smartecart.com',
        password: 'user123',
      });
      console.log('Test user created (user@smartecart.com / user123)');
    }

    console.log('Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
