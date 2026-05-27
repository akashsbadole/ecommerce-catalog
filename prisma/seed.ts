import { db } from '../src/lib/db';
import { hash } from 'bcryptjs';

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await db.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      email: 'admin@store.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    },
  });
  console.log('Created admin:', admin.email);

  // Create clerk user
  const clerkPassword = await hash('clerk123', 12);
  const clerk = await db.user.upsert({
    where: { email: 'clerk@store.com' },
    update: {},
    create: {
      email: 'clerk@store.com',
      name: 'Store Clerk',
      password: clerkPassword,
      role: 'clerk',
      isActive: true,
    },
  });
  console.log('Created clerk:', clerk.email);

  // Create categories
  const electronics = await db.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest electronic gadgets and devices',
      sortOrder: 1,
      isActive: true,
    },
  });

  const accessories = await db.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Premium accessories for everyday use',
      sortOrder: 2,
      isActive: true,
    },
  });

  const home = await db.category.create({
    data: {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Modern home and living products',
      sortOrder: 3,
      isActive: true,
    },
  });

  console.log('Created 3 categories');

  // Create products
  const products = [
    {
      name: 'Pro Wireless Headphones',
      slug: 'pro-wireless-headphones',
      description: 'Experience premium sound quality with our Pro Wireless Headphones. Featuring advanced noise-cancellation technology, 40-hour battery life, and ultra-comfortable memory foam ear cushions. Perfect for music lovers, professionals, and anyone who demands the best audio experience. The headphones come with a premium carrying case and USB-C charging cable.',
      shortDescription: 'Premium noise-cancelling wireless headphones with 40hr battery',
      price: 299.99,
      comparePrice: 399.99,
      sku: 'WH-PRO-001',
      images: JSON.stringify(['/products/headphones.png']),
      categoryId: electronics.id,
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
      specifications: JSON.stringify({
        'Driver Size': '40mm',
        'Frequency Response': '20Hz - 40kHz',
        'Battery Life': '40 hours',
        'Charging': 'USB-C',
        'Bluetooth': '5.3',
        'Weight': '250g',
        'Noise Cancellation': 'Active (ANC)',
      }),
    },
    {
      name: 'Titanium Smartwatch',
      slug: 'titanium-smartwatch',
      description: 'The Titanium Smartwatch combines elegance with cutting-edge technology. Track your fitness goals, receive notifications, and make payments right from your wrist. With its stunning AMOLED display and premium titanium build, this smartwatch is designed for those who appreciate both style and functionality. Water resistant to 50 meters and features GPS tracking.',
      shortDescription: 'Premium titanium smartwatch with AMOLED display',
      price: 449.99,
      comparePrice: 549.99,
      sku: 'SW-TIT-002',
      images: JSON.stringify(['/products/smartwatch.png']),
      categoryId: electronics.id,
      isFeatured: true,
      isActive: true,
      sortOrder: 2,
      specifications: JSON.stringify({
        'Display': '1.4" AMOLED',
        'Case Material': 'Titanium',
        'Water Resistance': '50m',
        'Battery Life': '7 days',
        'Sensors': 'Heart Rate, SpO2, GPS',
        'Connectivity': 'Bluetooth 5.2, WiFi',
        'Compatibility': 'iOS & Android',
      }),
    },
    {
      name: 'Executive Leather Bag',
      slug: 'executive-leather-bag',
      description: 'Crafted from full-grain Italian leather, the Executive Leather Bag is the perfect companion for business professionals. Featuring multiple compartments for laptops, documents, and essentials, with a padded shoulder strap for all-day comfort. The timeless design ensures it complements any professional attire.',
      shortDescription: 'Handcrafted Italian leather messenger bag',
      price: 189.99,
      comparePrice: 249.99,
      sku: 'BG-EXC-003',
      images: JSON.stringify(['/products/bag.png']),
      categoryId: accessories.id,
      isFeatured: true,
      isActive: true,
      sortOrder: 3,
      specifications: JSON.stringify({
        'Material': 'Full-grain Italian Leather',
        'Dimensions': '15" x 11" x 4"',
        'Laptop Fit': 'Up to 14"',
        'Pockets': '6 interior, 2 exterior',
        'Closure': 'Magnetic snap + zipper',
        'Strap': 'Adjustable padded',
        'Weight': '1.2kg',
      }),
    },
    {
      name: 'AirPods Elite',
      slug: 'airpods-elite',
      description: 'AirPods Elite deliver an immersive audio experience with industry-leading noise cancellation. With adaptive transparency mode, spatial audio, and a customizable fit with multiple ear tip options, these earbuds are perfect for music, calls, and everything in between. The compact charging case provides up to 30 hours of total listening time.',
      shortDescription: 'Premium true wireless earbuds with ANC',
      price: 199.99,
      comparePrice: 249.99,
      sku: 'EA-AIR-004',
      images: JSON.stringify(['/products/earbuds.png']),
      categoryId: electronics.id,
      isFeatured: false,
      isActive: true,
      sortOrder: 4,
      specifications: JSON.stringify({
        'Driver': 'Custom Apple-designed',
        'ANC': 'Active Noise Cancellation',
        'Battery (Buds)': '6 hours',
        'Battery (Case)': '30 hours total',
        'Charging': 'MagSafe / USB-C',
        'Water Resistance': 'IPX4',
        'Bluetooth': '5.3',
      }),
    },
    {
      name: 'Architect Desk Lamp',
      slug: 'architect-desk-lamp',
      description: 'The Architect Desk Lamp combines minimalist design with functional excellence. Featuring adjustable color temperature from warm to cool white, touch-sensitive controls, and a flexible arm that directs light exactly where you need it. Built with premium aluminum and a weighted base for stability.',
      shortDescription: 'Minimalist LED desk lamp with adjustable color temperature',
      price: 89.99,
      comparePrice: 119.99,
      sku: 'DL-ARC-005',
      images: JSON.stringify(['/products/lamp.png']),
      categoryId: home.id,
      isFeatured: false,
      isActive: true,
      sortOrder: 5,
      specifications: JSON.stringify({
        'Light Source': 'LED',
        'Color Temperature': '2700K - 6500K',
        'Brightness': '5 levels',
        'Power': '12W',
        'Arm Length': '45cm',
        'Base Diameter': '18cm',
        'Material': 'Aluminum alloy',
      }),
    },
    {
      name: 'Boom Portable Speaker',
      slug: 'boom-portable-speaker',
      description: 'Take your music anywhere with the Boom Portable Speaker. Featuring 360-degree sound, deep bass, and IP67 waterproof rating, this speaker is built for adventure. With 24-hour battery life, multi-speaker pairing, and built-in microphone for hands-free calls, it is the ultimate portable audio companion.',
      shortDescription: 'Waterproof portable speaker with 360° sound',
      price: 129.99,
      comparePrice: 169.99,
      sku: 'SP-BOOM-006',
      images: JSON.stringify(['/products/speaker.png']),
      categoryId: electronics.id,
      isFeatured: false,
      isActive: true,
      sortOrder: 6,
      specifications: JSON.stringify({
        'Output': '30W',
        'Drivers': '2 x 55mm + 2 x passive',
        'Battery Life': '24 hours',
        'Waterproof': 'IP67',
        'Bluetooth': '5.3',
        'Weight': '680g',
        'Charging': 'USB-C',
      }),
    },
  ];

  for (const product of products) {
    await db.product.create({ data: product });
  }
  console.log(`Created ${products.length} products`);

  // Create banners
  const banners = [
    {
      title: 'Summer Sale — Up to 40% Off',
      subtitle: 'Discover our best deals on premium electronics and accessories. Limited time offer.',
      image: '/products/headphones.png',
      link: '#catalogue',
      linkText: 'Shop Now',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'New Arrivals',
      subtitle: 'Check out the latest additions to our collection. Fresh styles, cutting-edge tech.',
      image: '/products/smartwatch.png',
      link: '#catalogue',
      linkText: 'Explore',
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'Free Shipping on Orders Over $100',
      subtitle: 'Enjoy complimentary shipping on all qualifying orders. No code needed.',
      image: '/products/bag.png',
      link: '#catalogue',
      linkText: 'Learn More',
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const banner of banners) {
    await db.banner.create({ data: banner });
  }
  console.log('Created 3 banners');

  // Create site settings
  const settings = [
    { key: 'site_name', value: 'StyleStore' },
    { key: 'site_description', value: 'Premium products for modern living' },
    { key: 'site_email', value: 'info@store.com' },
    { key: 'site_phone', value: '+1 (555) 123-4567' },
    { key: 'site_address', value: '123 Commerce Street, New York, NY 10001' },
    { key: 'currency', value: 'USD' },
    { key: 'currency_symbol', value: '$' },
    { key: 'social_facebook', value: 'https://facebook.com/store' },
    { key: 'social_instagram', value: 'https://instagram.com/store' },
    { key: 'social_twitter', value: 'https://twitter.com/store' },
    { key: 'smtp_host', value: '' },
    { key: 'smtp_port', value: '587' },
    { key: 'smtp_user', value: '' },
    { key: 'smtp_pass', value: '' },
    { key: 'email_from', value: 'noreply@store.com' },
  ];

  for (const setting of settings) {
    await db.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('Created site settings');

  // Create sample content page
  await db.contentPage.create({
    data: {
      title: 'About Us',
      slug: 'about-us',
      content: 'Welcome to StyleStore — your destination for premium products. We curate the finest selection of electronics, accessories, and home goods to bring you quality that stands the test of time. Our commitment to excellence means every product in our catalogue has been carefully selected for its design, functionality, and durability. Founded with a passion for quality, we believe everyone deserves access to products that enhance their daily lives.',
      isActive: true,
    },
  });

  await db.contentPage.create({
    data: {
      title: 'Shipping & Returns',
      slug: 'shipping-returns',
      content: 'We offer free shipping on all orders over $100. Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days. We accept returns within 30 days of purchase for unused items in original packaging. Contact our support team for return authorization.',
      isActive: true,
    },
  });

  console.log('Created content pages');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
