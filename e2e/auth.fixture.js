import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  loginViaApi: async ({ page, request }, use) => {
    const fn = async (email, password = 'Meekoo123!') => {
      const res = await request.post('http://localhost:3001/api/v1/auth/login', {
        data: { email, password }
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      await page.goto('/login');
      await page.evaluate((token) => {
        localStorage.setItem('meekoo_token', token);
      }, body.accessToken);
      return body;
    };
    await use(fn);
  },
  createIsolatedStudent: async ({ request }, use) => {
    const createdTokens = [];
    const fn = async (name = 'E2E Learner') => {
      const email = `e2e.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@meekoo.test`;
      const password = 'Password123!';
      const res = await request.post('http://localhost:3001/api/v1/auth/register', {
        data: { name, email, password }
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      createdTokens.push(body.accessToken);
      return { email, password, ...body };
    };
    await use(fn);
    for (const token of createdTokens) {
      await request.delete('http://localhost:3001/api/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  }
});

export { expect };
