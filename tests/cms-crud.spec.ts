import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('CMS CRUD Operations', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login to get token
    const loginRes = await request.post('/api/auth/login', {
      data: {
        email: 'admin@store.com',
        password: 'admin123', // Standard seed password
      }
    });
    const data = await loginRes.json();
    authToken = data.token;
  });

  test('should create, read, update, and delete a blog post', async ({ request }) => {
    const slug = `test-post-${Date.now()}`;

    // 1. Create
    const createRes = await request.post('/api/blog', {
      data: {
        title: 'Test Playwright Post',
        slug: slug,
        content: 'Test Content',
        isPublished: true,
      },
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    expect(createRes.status()).toBe(201);
    const { blogPost } = await createRes.json();
    expect(blogPost.title).toBe('Test Playwright Post');

    // Verify in DB
    const dbPost = await prisma.blogPost.findUnique({ where: { id: blogPost.id } });
    expect(dbPost).not.toBeNull();
    expect(dbPost?.title).toBe('Test Playwright Post');

    // 2. Read
    const getRes = await request.get(`/api/blog/${blogPost.id}`);
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.blogPost.slug).toBe(slug);

    // 3. Update
    const updateRes = await request.put(`/api/blog/${blogPost.id}`, {
      data: {
        title: 'Updated Playwright Post',
      },
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    expect(updateRes.status()).toBe(200);
    const { blogPost: updatedPost } = await updateRes.json();
    expect(updatedPost.title).toBe('Updated Playwright Post');

    // 4. Delete (Soft)
    const deleteRes = await request.delete(`/api/blog/${blogPost.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    expect(deleteRes.status()).toBe(200);

    const softDeletedPost = await prisma.blogPost.findUnique({ where: { id: blogPost.id } });
    expect(softDeletedPost?.deletedAt).not.toBeNull();

    // 5. Delete (Permanent)
    const permDeleteRes = await request.delete(`/api/blog/${blogPost.id}?permanent=true`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    expect(permDeleteRes.status()).toBe(200);

    const finalPost = await prisma.blogPost.findUnique({ where: { id: blogPost.id } });
    expect(finalPost).toBeNull();
  });

  test('should create, read, update, and delete a product', async ({ request }) => {
    const slug = `test-product-${Date.now()}`;

    // 1. Create
    const createRes = await request.post('/api/products', {
      data: {
        name: 'Test Playwright Product',
        slug: slug,
        price: 99.99,
        wholesalePrice: 79.99,
        minOrderQty: 10,
        isActive: true,
        images: '[]',
      },
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    expect(createRes.status()).toBe(201);
    const { product } = await createRes.json();

    // Verify in DB
    const dbProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(dbProduct).not.toBeNull();
    expect(dbProduct?.wholesalePrice).toBe(79.99);

    // 2. Read
    const getRes = await request.get(`/api/products/${product.id}`);
    expect(getRes.status()).toBe(200);
    const { product: fetchedProduct } = await getRes.json();
    expect(fetchedProduct.slug).toBe(slug);

    // 3. Update
    const updateRes = await request.put(`/api/products/${product.id}`, {
      data: {
        name: 'Updated Product Name',
        price: "109.99"
      },
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    expect(updateRes.status()).toBe(200);
    const { product: updatedProduct } = await updateRes.json();
    expect(updatedProduct.name).toBe('Updated Product Name');
    expect(updatedProduct.price).toBe(109.99);

    // 4. Delete (Soft)
    const deleteRes = await request.delete(`/api/products/${product.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    expect(deleteRes.status()).toBe(200);

    const softDeletedProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(softDeletedProduct?.deletedAt).not.toBeNull();

    // 5. Delete (Permanent)
    const permDeleteRes = await request.delete(`/api/products/${product.id}?permanent=true`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    expect(permDeleteRes.status()).toBe(200);

    const finalProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(finalProduct).toBeNull();
  });
});
