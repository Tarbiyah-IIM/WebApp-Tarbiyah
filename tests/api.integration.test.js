import crypto from 'node:crypto';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import app from '../server/app.js';
import { env } from '../server/config/env.js';
import { pool } from '../server/config/db.js';

describe('Meekoo Platform Integration & Sync Suite', () => {
  const testEmail = `test.${Date.now()}@meekoo.test`;
  let studentToken = '';
  let adminToken = '';
  let createdOrderId = null;

  afterAll(async () => {
    if (studentToken) {
      await request(app).delete('/api/v1/me').set('Authorization', `Bearer ${studentToken}`);
    }
    await pool.end();
  });

  it('returns complete synchronized landing page bundle', async () => {
    const res = await request(app).get('/api/v1/landing');
    expect(res.status).toBe(200);
    expect(res.body.settings.hero_title).toBeTruthy();
    expect(res.body.stats.hero.length).toBeGreaterThanOrEqual(4);
    expect(res.body.stats.journey.length).toBeGreaterThanOrEqual(5);
    expect(res.body.features.length).toBeGreaterThanOrEqual(4);
    expect(res.body.mentors.length).toBeGreaterThanOrEqual(1);
    expect(res.body.partners.length).toBeGreaterThanOrEqual(9);
    expect(res.body.testimonials.length).toBeGreaterThanOrEqual(6);
    expect(res.body.faqs.length).toBeGreaterThanOrEqual(5);
    expect(res.body.categories.length).toBeGreaterThanOrEqual(6);
  });

  it('paginates courses (6 per page) and filters by category', async () => {
    const page1 = await request(app).get('/api/v1/courses?page=1&limit=6');
    expect(page1.status).toBe(200);
    expect(page1.body.items.length).toBe(6);
    expect(page1.body.pagination.hasMore).toBe(true);

    const filtered = await request(app).get('/api/v1/courses?category=web-development');
    expect(filtered.status).toBe(200);
    expect(filtered.body.items.length).toBeGreaterThanOrEqual(1);
    for (const item of filtered.body.items) {
      expect(item.category_slug).toBe('web-development');
    }
  });

  it('registers student, enforces RBAC, and supports profile & password recovery', async () => {
    const reg = await request(app).post('/api/v1/auth/register').send({
      name: 'Test Learner',
      email: testEmail,
      password: 'Password123!'
    });
    expect(reg.status).toBe(201);
    expect(reg.body.user.role).toBe('student');
    studentToken = reg.body.accessToken;

    const forbiddenAdmin = await request(app)
      .get('/api/v1/admin/overview')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(forbiddenAdmin.status).toBe(403);

    const forgot = await request(app).post('/api/v1/auth/forgot-password').send({ email: testEmail });
    expect(forgot.status).toBe(200);
    expect(forgot.body.sandboxResetToken).toBeTruthy();

    const reset = await request(app).post('/api/v1/auth/reset-password').send({
      token: forgot.body.sandboxResetToken,
      newPassword: 'NewPassword123!'
    });
    expect(reset.status).toBe(200);

    const relogin = await request(app).post('/api/v1/auth/login').send({
      email: testEmail,
      password: 'NewPassword123!'
    });
    expect(relogin.status).toBe(200);
    studentToken = relogin.body.accessToken;
  });

  it('creates order, verifies signed webhook HMAC, unlocks course, tracks progress & issues certificate', async () => {
    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ orderType: 'course', courseIds: [3] });
    expect(orderRes.status).toBe(201);
    createdOrderId = orderRes.body.order.id;
    expect(orderRes.body.order.status).toBe('pending');

    const badWebhook = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-meekoo-signature', 'invalid_sig')
      .send({ orderId: createdOrderId, status: 'paid' });
    expect(badWebhook.status).toBe(401);

    const webhookBody = { orderId: createdOrderId, status: 'paid', gatewayRef: 'TEST-WH-01' };
    const sig = crypto
      .createHmac('sha256', env.paymentWebhookSecret)
      .update(JSON.stringify(webhookBody))
      .digest('hex');

    const goodWebhook = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-meekoo-signature', sig)
      .send(webhookBody);
    expect(goodWebhook.status).toBe(200);
    expect(goodWebhook.body.order.status).toBe('paid');

    const learnRes = await request(app)
      .get('/api/v1/courses/3/learn')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(learnRes.status).toBe(200);
    const lessonIds = learnRes.body.curriculum.flatMap((s) => s.lessons.map((l) => l.id));
    expect(lessonIds.length).toBeGreaterThan(0);

    let lastComplete = null;
    for (const lid of lessonIds) {
      lastComplete = await request(app)
        .post(`/api/v1/lessons/${lid}/complete`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(lastComplete.status).toBe(200);
    }
    expect(lastComplete.body.progressPct).toBe(100);
    expect(lastComplete.body.certificate?.certificate_code).toBeTruthy();

    const verifyCert = await request(app).get(`/api/v1/certificates/verify/${lastComplete.body.certificate.certificate_code}`);
    expect(verifyCert.status).toBe(200);
    expect(verifyCert.body.valid).toBe(true);
  });

  it('syncs admin settings update immediately with landing endpoint', async () => {
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@meekoo.test',
      password: 'Meekoo123!'
    });
    expect(adminLogin.status).toBe(200);
    adminToken = adminLogin.body.accessToken;

    const beforeLanding = await request(app).get('/api/v1/landing');
    const originalTitle = beforeLanding.body.settings.hero_title;

    const patchRes = await request(app)
      .patch('/api/v1/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ hero_title: 'Synced Title Verification' });
    expect(patchRes.status).toBe(200);

    const afterLanding = await request(app).get('/api/v1/landing');
    expect(afterLanding.body.settings.hero_title).toBe('Synced Title Verification');

    await request(app)
      .patch('/api/v1/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ hero_title: originalTitle });
  });
});
