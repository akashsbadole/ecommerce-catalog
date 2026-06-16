import { test, expect } from './fixtures';

test.describe('Orders', () => {
  test('GET /api/orders requires authentication', async ({ apiBase }) => {
    const res = await fetch(`${apiBase}/api/orders`);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBeTruthy();
  });

  test('GET /api/orders returns list for authenticated user', async ({ apiBase, adminToken, buyerToken }) => {
    const token = buyerToken || adminToken;
    if (!token) {
      test.skip(true, 'No auth token available');
      return;
    }

    const res = await fetch(`${apiBase}/api/orders`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.orders)).toBe(true);
  });

  test('POST /api/orders/guest creates order for guest without token', async ({ apiBase, baseProductId }) => {
    if (!baseProductId) {
      test.skip(true, 'No seeded product available');
      return;
    }

    const res = await fetch(`${apiBase}/api/orders/guest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: baseProductId, quantity: 1, price: 99.99 }],
        shippingName: 'Guest Buyer',
        shippingEmail: `guest_${Date.now()}@example.com`,
        shippingAddress: '123 Guest St',
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.order).toBeTruthy();
    expect(data.order.orderNumber).toBeTruthy();
  });

  test('GET /api/orders/[id] returns 401 without token', async ({ apiBase }) => {
    const res = await fetch(`${apiBase}/api/orders/non-existent-id`, {
      headers: { authorization: 'Bearer invalid-token' },
    });
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBeTruthy();
  });
});
