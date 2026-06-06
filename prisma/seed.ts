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
  const electronics = await db.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest electronic gadgets and devices',
      sortOrder: 1,
      isActive: true,
    },
  });

  const accessories = await db.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Premium accessories for everyday use',
      sortOrder: 2,
      isActive: true,
    },
  });

  const home = await db.category.upsert({
    where: { slug: 'home-living' },
    update: {},
    create: {
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
    {
      name: 'UltraSlim Laptop',
      slug: 'ultraslim-laptop',
      description: '<h2>Power Meets Portability</h2><p>The UltraSlim Laptop packs desktop-class performance into a 2.5lb chassis. Featuring the latest processor, 16GB RAM, and a stunning 14" 4K OLED display.</p><h3>Specs</h3><ul><li>14" 4K OLED</li><li>16GB RAM / 512GB SSD</li><li>12hr battery life</li><li>Thunderbolt 4</li></ul>',
      shortDescription: 'Lightweight laptop with 4K OLED and 12hr battery',
      price: 1299.99,
      comparePrice: 1599.99,
      wholesalePrice: 999.99,
      minOrderQty: 2,
      sku: 'LT-ULTRA-007',
      images: JSON.stringify(['/products/laptop.png']),
      categoryId: electronics.id,
      isFeatured: true,
      isActive: true,
      sortOrder: 7,
      specifications: JSON.stringify({
        'Processor': 'Intel Core i7',
        'RAM': '16GB DDR5',
        'Storage': '512GB SSD',
        'Display': '14" 4K OLED',
        'Battery': '12 hours',
        'Weight': '2.5 lbs',
        'Ports': 'Thunderbolt 4, USB-C',
      }),
    },
    {
      name: 'Mechanical Keyboard Pro',
      slug: 'mechanical-keyboard-pro',
      description: '<h2>Type with Precision</h2><p>Experience ultimate typing comfort with hot-swappable switches, per-key RGB, and a航空-grade aluminum frame. Perfect for developers and enthusiasts.</p>',
      shortDescription: 'Hot-swappable mechanical keyboard with RGB',
      price: 149.99,
      comparePrice: 199.99,
      wholesalePrice: 89.99,
      minOrderQty: 10,
      sku: 'KB-MECH-008',
      images: JSON.stringify(['/products/keyboard.png']),
      categoryId: electronics.id,
      isFeatured: false,
      isActive: true,
      sortOrder: 8,
      specifications: JSON.stringify({
        'Switches': 'Hot-swappable (Gateron)',
        'Layout': '75%',
        'Backlight': 'Per-key RGB',
        'Frame': 'Aluminum',
        'Connection': 'USB-C / Bluetooth 5.1',
        'Battery': '4000mAh',
        'Keycaps': 'PBT Double-shot',
      }),
    },
    {
      name: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      description: '<h2>Work in Comfort</h2><p>Premium ergonomic chair with adjustable lumbar support, 4D armrests, breathable mesh back, and memory foam seat cushion for all-day comfort.</p>',
      shortDescription: 'Premium ergonomic chair with lumbar support',
      price: 449.99,
      comparePrice: 599.99,
      wholesalePrice: 299.99,
      minOrderQty: 5,
      sku: 'CH-ERGO-009',
      images: JSON.stringify(['/products/chair.png']),
      categoryId: home.id,
      isFeatured: false,
      isActive: true,
      sortOrder: 9,
      specifications: JSON.stringify({
        'Material': 'Mesh back + Memory foam seat',
        'Lumbar Support': 'Adjustable',
        'Armrests': '4D',
        'Weight Capacity': '300 lbs',
        'Seat Height': '15" - 20"',
        'Recline': '90° - 135°',
        'Warranty': '5 years',
      }),
    },
    {
      name: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-tshirt',
      description: '<h2>Everyday Essential</h2><p>Crafted from 100% organic ring-spun cotton, this premium t-shirt offers exceptional softness and durability. Available in multiple colors.</p>',
      shortDescription: 'Organic cotton premium t-shirt',
      price: 34.99,
      comparePrice: 49.99,
      wholesalePrice: 19.99,
      minOrderQty: 25,
      sku: 'TS-PREMIUM-010',
      images: JSON.stringify(['/products/tshirt.png']),
      categoryId: accessories.id,
      isFeatured: false,
      isActive: true,
      sortOrder: 10,
      specifications: JSON.stringify({
        'Material': '100% Organic Cotton',
        'Weight': '180 GSM',
        'Fit': 'Regular',
        'Sizes': 'S - 3XL',
        'Colors': 'Black, White, Navy, Gray',
        'Care': 'Machine washable',
        'Certification': 'OEKO-TEX',
      }),
    },
    {
      name: 'Smart LED Monitor 27"',
      slug: 'smart-led-monitor-27',
      description: '<h2>Immersive Visuals</h2><p>27" 4K UHD monitor with USB-C hub, built-in speakers, and eye-care technology. Ideal for creative professionals and productivity.</p>',
      shortDescription: '27" 4K UHD monitor with USB-C hub',
      price: 379.99,
      comparePrice: 499.99,
      wholesalePrice: 259.99,
      minOrderQty: 3,
      sku: 'MN-SMART-011',
      images: JSON.stringify(['/products/monitor.png']),
      categoryId: electronics.id,
      isFeatured: true,
      isActive: true,
      sortOrder: 11,
      specifications: JSON.stringify({
        'Size': '27"',
        'Resolution': '4K UHD (3840x2160)',
        'Panel Type': 'IPS',
        'Refresh Rate': '75Hz',
        'Brightness': '350 nits',
        'Ports': 'USB-C, HDMI 2.1, DP 1.4',
        'Speakers': 'Built-in 5W x2',
      }),
    },
    {
      name: 'Ceramic Coffee Mug Set',
      slug: 'ceramic-coffee-mug-set',
      description: '<h2>Sip in Style</h2><p>Set of 4 handcrafted ceramic mugs with minimalist matte finish. Microwave and dishwasher safe. Perfect for home or office.</p>',
      shortDescription: 'Set of 4 handcrafted ceramic mugs',
      price: 39.99,
      comparePrice: 54.99,
      wholesalePrice: 22.99,
      minOrderQty: 20,
      sku: 'MG-CERAMIC-012',
      images: JSON.stringify(['/products/mugs.png']),
      categoryId: home.id,
      isFeatured: false,
      isActive: true,
      sortOrder: 12,
      specifications: JSON.stringify({
        'Material': 'Premium Ceramic',
        'Capacity': '350ml each',
        'Set Size': '4 mugs',
        'Finish': 'Matte glaze',
        'Dishwasher Safe': 'Yes',
        'Microwave Safe': 'Yes',
        'Colors': 'Assorted earth tones',
      }),
    },
  ];

  for (const product of products) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log(`Created ${products.length} products`);

  // Create banners
  const banners = [
    {
      title: 'Premium Makhana — Healthy & Delicious',
      subtitle: 'Discover our handpicked roasted makhana and premium dry fruits. Naturally good.',
      image: '/products/headphones.png',
      link: '#catalogue',
      linkText: 'Shop Now',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'New Flavors Added',
      subtitle: 'Check out our latest khakhra and bhakhri flavors. Crunchy, tasty, wholesome.',
      image: '/products/smartwatch.png',
      link: '#catalogue',
      linkText: 'Explore',
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'Bulk Orders Welcome',
      subtitle: 'Wholesale pricing available for businesses. Get the best deals on healthy snacks.',
      image: '/products/bag.png',
      link: '#catalogue',
      linkText: 'Learn More',
      sortOrder: 3,
      isActive: true,
    },
  ];

  await db.banner.deleteMany();
  for (const banner of banners) {
    await db.banner.create({ data: banner });
  }
  console.log('Created 3 banners');

  // Create site settings — use env var fallbacks for generic deployment
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'My Store';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const siteEmail = process.env.SITE_EMAIL || '';
  const sitePhone = process.env.SITE_PHONE || '';
  const siteAddress = process.env.SITE_ADDRESS || '';
  const currency = process.env.STORE_CURRENCY || 'USD';
  const currencySymbol = process.env.STORE_CURRENCY_SYMBOL || '$';

  const settings = [
    { key: 'site_name', value: siteName },
    { key: 'site_description', value: 'Your trusted online store for quality products.' },
    { key: 'site_email', value: siteEmail },
    { key: 'site_phone', value: sitePhone },
    { key: 'site_address', value: siteAddress },
    { key: 'currency', value: currency },
    { key: 'currency_symbol', value: currencySymbol },
    { key: 'social_facebook', value: process.env.SOCIAL_FACEBOOK || '' },
    { key: 'social_instagram', value: process.env.SOCIAL_INSTAGRAM || '' },
    { key: 'social_twitter', value: process.env.SOCIAL_TWITTER || '' },
    { key: 'whatsapp_number', value: process.env.WHATSAPP_NUMBER || '' },
    { key: 'smtp_host', value: process.env.SMTP_HOST || '' },
    { key: 'smtp_port', value: process.env.SMTP_PORT || '587' },
    { key: 'smtp_user', value: process.env.SMTP_USER || '' },
    { key: 'smtp_pass', value: process.env.SMTP_PASS || '' },
    { key: 'email_from', value: process.env.EMAIL_FROM || '' },
    { key: 'seo_default_title', value: `${siteName} - Your Trusted Online Store` },
    { key: 'seo_default_description', value: `${siteName} is a trusted online store offering quality products at competitive prices.` },
    { key: 'seo_ga_id', value: process.env.SEO_GA_ID || '' },
    { key: 'seo_fb_pixel', value: process.env.SEO_FB_PIXEL || '' },
    { key: 'seo_canonical_url', value: siteUrl },
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

  // Create content pages — use siteName from settings above
  const pages = [
    {
      title: 'About Us',
      slug: 'about-us',
      heroImage: '/products/smartwatch.png',
      content: `<h2>Welcome to ${siteName}</h2><p>${siteName} is your destination for premium products. We curate the finest selection to bring you quality that stands the test of time.</p><h3>Our Mission</h3><p>Founded with a passion for quality, we believe everyone deserves access to products that enhance their daily lives. Our team carefully selects each product based on design, functionality, and durability.</p><h3>Why Choose Us</h3><ul><li><strong>Quality First:</strong> Every product undergoes rigorous quality testing</li><li><strong>Competitive Pricing:</strong> Wholesale prices for bulk orders</li><li><strong>Expert Support:</strong> Our team is always ready to help</li><li><strong>Fast Shipping:</strong> Quick delivery worldwide</li></ul><h3>Our Values</h3><p>We are committed to sustainability, ethical sourcing, and exceptional customer service. Every purchase you make contributes to a better future.</p>`,
      metaTitle: `About ${siteName} - Our Story`,
      metaDescription: `Learn about ${siteName}, your trusted partner for quality products.`,
      isActive: true,
      sortOrder: 1,
    },
    {
      title: 'Shipping & Returns',
      slug: 'shipping-returns',
      content: '<h2>Shipping Policy</h2><h3>Free Shipping</h3><p>We offer free shipping on all orders over $100. Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days.</p><h3>International Shipping</h3><p>We ship worldwide. International delivery typically takes 7-14 business days depending on your location.</p><h2>Returns Policy</h2><p>We accept returns within 30 days of purchase for unused items in original packaging. Contact our support team for return authorization.</p><h3>How to Return</h3><ol><li>Contact our support team with your order number</li><li>Receive a return authorization label</li><li>Pack the item securely</li><li>Drop off at your nearest shipping point</li></ol>',
      metaTitle: 'Shipping & Returns Policy',
      metaDescription: 'Read our shipping and returns policy. Free shipping on orders over $100. 30-day return policy.',
      isActive: true,
      sortOrder: 2,
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms-conditions',
      content: '<h2>Terms and Conditions</h2><p>By accessing and using this website, you agree to be bound by these terms and conditions.</p><h3>Use of Website</h3><p>All content on this website is for general information purposes only. We reserve the right to modify content at any time.</p><h3>Orders and Pricing</h3><p>All prices are displayed in USD and are subject to change without notice. We reserve the right to refuse any order.</p><h3>Privacy</h3><p>We respect your privacy and handle your personal information in accordance with our Privacy Policy.</p>',
      isActive: true,
      sortOrder: 3,
    },
  ];
  for (const page of pages) {
    await db.contentPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log('Created 3 content pages');

  // Create blog posts
  const posts = [
    {
      title: '5 Must-Have Tech Accessories for 2025',
      slug: 'must-have-tech-accessories-2025',
      excerpt: 'Discover the essential tech accessories that will elevate your daily workflow and lifestyle this year.',
      content: '<h2>The Top Tech Accessories of 2025</h2><p>Technology continues to evolve at a rapid pace, and the right accessories can make all the difference in your daily life. Here are our top picks for 2025.</p><h3>1. Wireless Charging Pad</h3><p>A high-quality wireless charging pad is a desk essential. Look for one with fast charging capabilities and multiple coil support for flexible positioning.</p><h3>2. USB-C Hub</h3><p>With laptops shipping fewer ports, a USB-C hub is indispensable. Choose one with HDMI, USB-A, SD card reader, and power delivery.</p><h3>3. Noise-Cancelling Earbuds</h3><p>Perfect for focus work or commuting, modern ANC earbuds offer incredible sound quality and battery life.</p><h3>4. Portable Power Bank</h3><p>Keep your devices charged on the go with a high-capacity power bank that supports fast charging for all your devices.</p><h3>5. Laptop Stand</h3><p>Ergonomic and practical, a good laptop stand improves your posture and keeps your workspace tidy.</p><p>Stay tuned for more product reviews and recommendations from our team!</p>',
      coverImage: '/products/headphones.png',
      authorId: admin.id,
      tags: JSON.stringify(['tech', 'accessories', '2025', 'reviews']),
      isPublished: true,
      publishedAt: new Date('2025-01-15'),
      metaTitle: '5 Must-Have Tech Accessories for 2025 | Blog',
      metaDescription: 'Discover the essential tech accessories that will elevate your daily workflow and lifestyle this year.',
    },
    {
      title: 'Wholesale Buying Guide: Tips for B2B Buyers',
      slug: 'wholesale-buying-guide-b2b',
      excerpt: 'Essential tips and strategies for businesses looking to purchase products at wholesale prices.',
      content: '<h2>Complete B2B Wholesale Buying Guide</h2><p>Buying wholesale can be a game-changer for your business, but it requires knowledge and strategy. This guide covers everything you need to know.</p><h3>Understanding Minimum Order Quantities (MOQ)</h3><p>Most suppliers set MOQs to ensure profitability. Understanding MOQs helps you plan your inventory and budget effectively. Our MOQs start from as low as 1 unit for some products.</p><h3>Negotiating Better Prices</h3><p>Volume is your best negotiating tool. Consider these strategies:</p><ul><li>Order larger quantities for better per-unit pricing</li><li>Establish long-term supplier relationships</li><li>Ask about seasonal discounts and promotions</li><li>Inquire about tiered pricing structures</li></ul><h3>Quality Assurance</h3><p>Always request samples before placing large orders. Check product specifications, materials, and finish quality.</p><h3>Shipping and Logistics</h3><p>Plan your logistics carefully. Consider lead times, shipping costs, and customs duties for international orders.</p><p>Ready to start buying wholesale? <a href="/catalogue">Browse our catalogue</a> or <a href="/contact">contact our sales team</a> for personalized quotes.</p>',
      coverImage: '/products/bag.png',
      authorId: admin.id,
      tags: JSON.stringify(['wholesale', 'B2B', 'buying guide', 'business']),
      isPublished: true,
      publishedAt: new Date('2025-02-01'),
      metaTitle: 'Wholesale Buying Guide for B2B Buyers | Blog',
      metaDescription: 'Essential tips and strategies for businesses looking to purchase products at wholesale prices.',
    },
    {
      title: 'How to Choose the Right Headphones',
      slug: 'how-to-choose-right-headphones',
      excerpt: 'A comprehensive guide to finding the perfect headphones for your needs, from budget options to premium picks.',
      content: '<h2>Finding Your Perfect Headphones</h2><p>With so many options on the market, choosing the right headphones can be overwhelming. This guide breaks down the key factors to consider.</p><h3>Over-Ear vs On-Ear vs In-Ear</h3><p>Each form factor has its advantages. Over-ear headphones offer the best sound quality and noise isolation, on-ear models are more portable, and in-ear options are the most compact.</p><h3>Key Features to Look For</h3><ul><li><strong>Active Noise Cancellation (ANC):</strong> Essential for noisy environments</li><li><strong>Battery Life:</strong> Look for at least 20 hours for wireless models</li><li><strong>Comfort:</strong> Memory foam ear cushions for extended wear</li><li><strong>Sound Quality:</strong> Balanced sound with clear highs and deep bass</li><li><strong>Connectivity:</strong> Bluetooth 5.2 or higher for stable connection</li></ul><h3>Budget Considerations</h3><p>You do not need to spend a fortune for good quality. There are excellent options at every price point.</p>',
      coverImage: '/products/earbuds.png',
      authorId: clerk.id,
      tags: JSON.stringify(['headphones', 'guide', 'audio', 'reviews']),
      isPublished: false,
      metaTitle: 'How to Choose the Right Headphones | Blog',
      metaDescription: 'A comprehensive guide to finding the perfect headphones for your needs.',
    },
  ];
  for (const post of posts) {
    await db.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log('Created 3 blog posts');

  // Create sample redirects
  for (const redirect of [
    { from: '/old-about', to: '/about-us', type: '301', isActive: true },
    { from: '/products-old', to: '/catalogue', type: '301', isActive: true },
  ]) {
    await db.redirect.upsert({
      where: { from: redirect.from },
      update: {},
      create: redirect,
    });
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
