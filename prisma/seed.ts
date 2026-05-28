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

  // Create products with B2B fields + WhatsApp
  const products = [
    {
      name: 'Pro Wireless Headphones',
      slug: 'pro-wireless-headphones',
      description: '<h2>Premium Sound Experience</h2><p>Experience premium sound quality with our Pro Wireless Headphones. Featuring advanced noise-cancellation technology, 40-hour battery life, and ultra-comfortable memory foam ear cushions.</p><h3>Key Features</h3><ul><li>Advanced Active Noise Cancellation</li><li>40-hour battery life</li><li>Ultra-comfortable memory foam ear cushions</li><li>USB-C fast charging</li><li>Bluetooth 5.3 multipoint</li></ul><p>The headphones come with a premium carrying case and USB-C charging cable.</p>',
      shortDescription: 'Premium noise-cancelling wireless headphones with 40hr battery',
      price: 299.99,
      comparePrice: 399.99,
      wholesalePrice: 189.99,
      minOrderQty: 5,
      sku: 'WH-PRO-001',
      images: JSON.stringify(['/products/headphones.png']),
      categoryId: electronics.id,
      whatsappNumber: '+1234567890',
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
      description: '<h2>Elegant Meets Technology</h2><p>The Titanium Smartwatch combines elegance with cutting-edge technology. Track your fitness goals, receive notifications, and make payments right from your wrist.</p><h3>Specifications</h3><ul><li>1.4" AMOLED display</li><li>Premium titanium build</li><li>Water resistant to 50 meters</li><li>GPS tracking</li><li>7-day battery life</li></ul>',
      shortDescription: 'Premium titanium smartwatch with AMOLED display',
      price: 449.99,
      comparePrice: 549.99,
      wholesalePrice: 299.99,
      minOrderQty: 3,
      sku: 'SW-TIT-002',
      images: JSON.stringify(['/products/smartwatch.png']),
      categoryId: electronics.id,
      whatsappNumber: '+1234567890',
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
      description: '<h2>Handcrafted Excellence</h2><p>Crafted from full-grain Italian leather, the Executive Leather Bag is the perfect companion for business professionals. Featuring multiple compartments for laptops, documents, and essentials.</p>',
      shortDescription: 'Handcrafted Italian leather messenger bag',
      price: 189.99,
      comparePrice: 249.99,
      wholesalePrice: 119.99,
      minOrderQty: 10,
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
      description: '<h2>Immersive Audio</h2><p>AirPods Elite deliver an immersive audio experience with industry-leading noise cancellation. With adaptive transparency mode, spatial audio, and a customizable fit.</p>',
      shortDescription: 'Premium true wireless earbuds with ANC',
      price: 199.99,
      comparePrice: 249.99,
      wholesalePrice: 129.99,
      minOrderQty: 10,
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
      description: '<h2>Minimalist Design</h2><p>The Architect Desk Lamp combines minimalist design with functional excellence. Featuring adjustable color temperature from warm to cool white and touch-sensitive controls.</p>',
      shortDescription: 'Minimalist LED desk lamp with adjustable color temperature',
      price: 89.99,
      comparePrice: 119.99,
      wholesalePrice: 49.99,
      minOrderQty: 20,
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
      description: '<h2>Take Music Anywhere</h2><p>Take your music anywhere with the Boom Portable Speaker. Featuring 360-degree sound, deep bass, and IP67 waterproof rating.</p>',
      shortDescription: 'Waterproof portable speaker with 360° sound',
      price: 129.99,
      comparePrice: 169.99,
      wholesalePrice: 79.99,
      minOrderQty: 10,
      sku: 'SP-BOOM-006',
      images: JSON.stringify(['/products/speaker.png']),
      categoryId: electronics.id,
      isFeatured: false,
      isActive: true,
      sortOrder: 6,
      whatsappNumber: '+1234567890',
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
    { key: 'whatsapp_number', value: '+1234567890' },
    { key: 'smtp_host', value: '' },
    { key: 'smtp_port', value: '587' },
    { key: 'smtp_user', value: '' },
    { key: 'smtp_pass', value: '' },
    { key: 'email_from', value: 'noreply@store.com' },
    { key: 'seo_default_title', value: 'StyleStore - Premium Products' },
    { key: 'seo_default_description', value: 'Discover premium products at StyleStore. Browse our curated catalogue of high-quality items with competitive pricing and excellent customer service.' },
    { key: 'seo_ga_id', value: '' },
    { key: 'seo_fb_pixel', value: '' },
    { key: 'seo_canonical_url', value: 'https://your-domain.com' },
    { key: 'b2b_show_company_fields', value: 'true' },
    { key: 'b2b_require_company', value: 'false' },
    { key: 'b2b_default_moq', value: '1' },
    { key: 'b2b_auto_reply', value: 'true' },
  ];

  for (const setting of settings) {
    await db.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('Created site settings');

  // Create content pages
  await db.contentPage.create({
    data: {
      title: 'About Us',
      slug: 'about-us',
      heroImage: '/products/smartwatch.png',
      content: '<h2>Welcome to StyleStore</h2><p>StyleStore is your destination for premium products. We curate the finest selection of electronics, accessories, and home goods to bring you quality that stands the test of time.</p><h3>Our Mission</h3><p>Founded with a passion for quality, we believe everyone deserves access to products that enhance their daily lives. Our team carefully selects each product based on design, functionality, and durability.</p><h3>Why Choose Us</h3><ul><li><strong>Quality First:</strong> Every product undergoes rigorous quality testing</li><li><strong>Competitive Pricing:</strong> Wholesale prices for bulk orders</li><li><strong>Expert Support:</strong> Our team is always ready to help</li><li><strong>Fast Shipping:</strong> Quick delivery worldwide</li></ul><h3>Our Values</h3><p>We are committed to sustainability, ethical sourcing, and exceptional customer service. Every purchase you make contributes to a better future.</p>',
      metaTitle: 'About StyleStore - Our Story',
      metaDescription: 'Learn about StyleStore, your trusted partner for premium electronics, accessories, and home products.',
      isActive: true,
      sortOrder: 1,
    },
  });

  await db.contentPage.create({
    data: {
      title: 'Shipping & Returns',
      slug: 'shipping-returns',
      content: '<h2>Shipping Policy</h2><h3>Free Shipping</h3><p>We offer free shipping on all orders over $100. Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days.</p><h3>International Shipping</h3><p>We ship worldwide. International delivery typically takes 7-14 business days depending on your location.</p><h2>Returns Policy</h2><p>We accept returns within 30 days of purchase for unused items in original packaging. Contact our support team for return authorization.</p><h3>How to Return</h3><ol><li>Contact our support team with your order number</li><li>Receive a return authorization label</li><li>Pack the item securely</li><li>Drop off at your nearest shipping point</li></ol>',
      metaTitle: 'Shipping & Returns Policy',
      metaDescription: 'Read our shipping and returns policy. Free shipping on orders over $100. 30-day return policy.',
      isActive: true,
      sortOrder: 2,
    },
  });

  await db.contentPage.create({
    data: {
      title: 'Terms & Conditions',
      slug: 'terms-conditions',
      content: '<h2>Terms and Conditions</h2><p>By accessing and using this website, you agree to be bound by these terms and conditions.</p><h3>Use of Website</h3><p>All content on this website is for general information purposes only. We reserve the right to modify content at any time.</p><h3>Orders and Pricing</h3><p>All prices are displayed in USD and are subject to change without notice. We reserve the right to refuse any order.</p><h3>Privacy</h3><p>We respect your privacy and handle your personal information in accordance with our Privacy Policy.</p>',
      isActive: true,
      sortOrder: 3,
    },
  });

  console.log('Created 3 content pages');

  // Create blog posts
  await db.blogPost.create({
    data: {
      title: '5 Must-Have Tech Accessories for 2025',
      slug: 'must-have-tech-accessories-2025',
      excerpt: 'Discover the essential tech accessories that will elevate your daily workflow and lifestyle this year.',
      content: '<h2>The Top Tech Accessories of 2025</h2><p>Technology continues to evolve at a rapid pace, and the right accessories can make all the difference in your daily life. Here are our top picks for 2025.</p><h3>1. Wireless Charging Pad</h3><p>A high-quality wireless charging pad is a desk essential. Look for one with fast charging capabilities and multiple coil support for flexible positioning.</p><h3>2. USB-C Hub</h3><p>With laptops shipping fewer ports, a USB-C hub is indispensable. Choose one with HDMI, USB-A, SD card reader, and power delivery.</p><h3>3. Noise-Cancelling Earbuds</h3><p>Perfect for focus work or commuting, modern ANC earbuds offer incredible sound quality and battery life.</p><h3>4. Portable Power Bank</h3><p>Keep your devices charged on the go with a high-capacity power bank that supports fast charging for all your devices.</p><h3>5. Laptop Stand</h3><p>Ergonomic and practical, a good laptop stand improves your posture and keeps your workspace tidy.</p><p>Stay tuned for more product reviews and tech recommendations from the StyleStore team!</p>',
      coverImage: '/products/headphones.png',
      authorId: admin.id,
      tags: JSON.stringify(['tech', 'accessories', '2025', 'reviews']),
      isPublished: true,
      publishedAt: new Date('2025-01-15'),
      metaTitle: '5 Must-Have Tech Accessories for 2025 | StyleStore Blog',
      metaDescription: 'Discover the essential tech accessories that will elevate your daily workflow and lifestyle this year.',
    },
  });

  await db.blogPost.create({
    data: {
      title: 'Wholesale Buying Guide: Tips for B2B Buyers',
      slug: 'wholesale-buying-guide-b2b',
      excerpt: 'Essential tips and strategies for businesses looking to purchase products at wholesale prices.',
      content: '<h2>Complete B2B Wholesale Buying Guide</h2><p>Buying wholesale can be a game-changer for your business, but it requires knowledge and strategy. This guide covers everything you need to know.</p><h3>Understanding Minimum Order Quantities (MOQ)</h3><p>Most suppliers set MOQs to ensure profitability. Understanding MOQs helps you plan your inventory and budget effectively. At StyleStore, our MOQs start from as low as 1 unit for some products.</p><h3>Negotiating Better Prices</h3><p>Volume is your best negotiating tool. Consider these strategies:</p><ul><li>Order larger quantities for better per-unit pricing</li><li>Establish long-term supplier relationships</li><li>Ask about seasonal discounts and promotions</li><li>Inquire about tiered pricing structures</li></ul><h3>Quality Assurance</h3><p>Always request samples before placing large orders. Check product specifications, materials, and finish quality.</p><h3>Shipping and Logistics</h3><p>Plan your logistics carefully. Consider lead times, shipping costs, and customs duties for international orders.</p><p>Ready to start buying wholesale? <a href="/catalogue">Browse our catalogue</a> or <a href="/contact">contact our sales team</a> for personalized quotes.</p>',
      coverImage: '/products/bag.png',
      authorId: admin.id,
      tags: JSON.stringify(['wholesale', 'B2B', 'buying guide', 'business']),
      isPublished: true,
      publishedAt: new Date('2025-02-01'),
      metaTitle: 'Wholesale Buying Guide for B2B Buyers | StyleStore Blog',
      metaDescription: 'Essential tips and strategies for businesses looking to purchase products at wholesale prices.',
    },
  });

  await db.blogPost.create({
    data: {
      title: 'How to Choose the Right Headphones',
      slug: 'how-to-choose-right-headphones',
      excerpt: 'A comprehensive guide to finding the perfect headphones for your needs, from budget options to premium picks.',
      content: '<h2>Finding Your Perfect Headphones</h2><p>With so many options on the market, choosing the right headphones can be overwhelming. This guide breaks down the key factors to consider.</p><h3>Over-Ear vs On-Ear vs In-Ear</h3><p>Each form factor has its advantages. Over-ear headphones offer the best sound quality and noise isolation, on-ear models are more portable, and in-ear options are the most compact.</p><h3>Key Features to Look For</h3><ul><li><strong>Active Noise Cancellation (ANC):</strong> Essential for noisy environments</li><li><strong>Battery Life:</strong> Look for at least 20 hours for wireless models</li><li><strong>Comfort:</strong> Memory foam ear cushions for extended wear</li><li><strong>Sound Quality:</strong> Balanced sound with clear highs and deep bass</li><li><strong>Connectivity:</strong> Bluetooth 5.2 or higher for stable connection</li></ul><h3>Budget Considerations</h3><p>You do not need to spend a fortune for good quality. There are excellent options at every price point.</p>',
      coverImage: '/products/earbuds.png',
      authorId: clerk.id,
      tags: JSON.stringify(['headphones', 'guide', 'audio', 'reviews']),
      isPublished: false,
      metaTitle: 'How to Choose the Right Headphones | StyleStore Blog',
      metaDescription: 'A comprehensive guide to finding the perfect headphones for your needs.',
    },
  });

  console.log('Created 3 blog posts');

  // Create sample redirects
  for (const redirect of [
    { from: '/old-about', to: '/about-us', type: '301', isActive: true },
    { from: '/products-old', to: '/catalogue', type: '301', isActive: true },
  ]) {
    await db.redirect.create({ data: redirect });
  }
  console.log('Created redirects');

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
