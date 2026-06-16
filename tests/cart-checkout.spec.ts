import { test, expect } from './fixtures';

test.describe('Cart', () => {
  test('GET /api/cart requires authentication', async ({ apiBase }) => {
    const res = await fetch(`${apiBase}/api/cart`);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBeTruthy();
  });

  test('add item to cart via API', async ({ apiBase, adminToken }) => {
    const listRes = await fetch(`${apiBase}/api/products?limit=1`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const listData = await listRes.json();
    const productId = listData?.products?.[0]?.id;
    if (!productId) {
      test.skip(true, 'No seeded product available');
      return;
    }

    const res = await fetch(`${apiBase}/api/cart`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.itemCount).toBeGreaterThan(0);
  });

  test('update cart item quantity via API', async ({ apiBase, adminToken }) => {
    const listRes = await fetch(`${apiBase}/api/products?limit=1`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const listData = await listRes.json();
    const productId = listData?.products?.[0]?.id;
    if (!productId) {
      test.skip(true, 'No seeded product available');
      return;
    }

    const addRes = await fetch(`${apiBase}/api/cart`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ productId, quantity: 2 }),
    });
    const addData = await addRes.json();
    const itemId = addData?.items?.[0]?.id;
    if (!itemId) {
      test.skip(true, 'No cart item created');
      return;
    }

    const res = await fetch(`${apiBase}/api/cart`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ itemId, quantity: 3 }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.itemCount).toBeGreaterThanOrEqual(3);

    await fetch(`${apiBase}/api/cart?itemId=${itemId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${adminToken}` },
    });
  });

  test('GET /api/cart returns items with token', async ({ apiBase, adminToken }) => {
    const res = await fetch(`${apiBase}/api/cart`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.items)).toBe(true);
  });
});
