import bcrypt from 'bcryptjs';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import app from '../server/app.js';
import { pool } from '../server/config/db.js';
import { findUserByEmail, updateUserPassword } from '../server/models/user.model.js';

describe('Fakultas Tarbiyah Portal Integration & Sync Suite', () => {
  const testEmail = `test.${Date.now()}@tarbiyah.test`;
  let userToken = '';
  let adminToken = '';

  afterAll(async () => {
    if (userToken) {
      await request(app).delete('/api/v1/me').set('Authorization', `Bearer ${userToken}`);
    }
    await pool.end();
  });

  it('returns complete synchronized landing page bundle and excludes removed course endpoints', async () => {
    const res = await request(app).get('/api/v1/landing');
    expect(res.status).toBe(200);
    expect(res.body.settings.hero_title).toBeTruthy();
    expect(res.body.stats.hero.length).toBeGreaterThanOrEqual(4);
    expect(res.body.stats.journey.length).toBeGreaterThanOrEqual(4);
    expect(res.body.features.length).toBeGreaterThanOrEqual(4);
    expect(res.body.partners.length).toBe(5);
    expect(res.body.testimonials.length).toBeGreaterThanOrEqual(6);
    expect(res.body.faqs.length).toBeGreaterThanOrEqual(5);

    const removedCourses = await request(app).get('/api/v1/courses');
    expect(removedCourses.status).toBe(404);
    const removedCategories = await request(app).get('/api/v1/categories');
    expect(removedCategories.status).toBe(404);
    const removedMentors = await request(app).get('/api/v1/mentors');
    expect(removedMentors.status).toBe(404);
  });

  it('enforces RBAC, supports profile update, and validates admin password recovery', async () => {
    const reg = await request(app).post('/api/v1/auth/register').send({
      name: 'Test Portal User',
      email: testEmail,
      password: 'Password123!'
    });
    expect(reg.status).toBe(201);
    userToken = reg.body.accessToken;

    const forbiddenAdmin = await request(app)
      .get('/api/v1/admin/overview')
      .set('Authorization', `Bearer ${userToken}`);
    expect(forbiddenAdmin.status).toBe(403);

    const meRes = await request(app)
      .patch('/api/v1/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Updated Portal User' });
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.name).toBe('Updated Portal User');

    const wrongRecovery1 = await request(app).post('/api/v1/auth/forgot-password').send({ email: testEmail });
    expect(wrongRecovery1.status).toBe(400);

    const wrongRecovery2 = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'tarbiyah@iim.ac.id' });
    expect(wrongRecovery2.status).toBe(400);

    const tarbiyahAdminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'tarbiyah@iim.ac.id',
      password: 'adminganteng'
    });
    expect(tarbiyahAdminLogin.status).toBe(200);
    expect(tarbiyahAdminLogin.body.user.role).toBe('admin');
    adminToken = tarbiyahAdminLogin.body.accessToken;

    try {
      const forgot = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'iimtarbiyah20232@gmail.com' });
      expect(forgot.status).toBe(200);
      expect(forgot.body.sandboxResetToken).toBeTruthy();

      const reset = await request(app).post('/api/v1/auth/reset-password').send({
        token: forgot.body.sandboxResetToken,
        newPassword: 'TempAdminPass123!'
      });
      expect(reset.status).toBe(200);

      const adminRelogin = await request(app).post('/api/v1/auth/login').send({
        email: 'tarbiyah@iim.ac.id',
        password: 'TempAdminPass123!'
      });
      expect(adminRelogin.status).toBe(200);
      expect(adminRelogin.body.user.role).toBe('admin');
    } finally {
      const adminUser = await findUserByEmail('tarbiyah@iim.ac.id');
      if (adminUser) {
        const originalHash = await bcrypt.hash('adminganteng', 10);
        await updateUserPassword(adminUser.id, originalHash);
      }
    }
  });

  it('syncs admin overview, user list, and landing CMS settings immediately', async () => {
    const overviewRes = await request(app)
      .get('/api/v1/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(overviewRes.status).toBe(200);
    expect(overviewRes.body.stats.totalUsers).toBeGreaterThanOrEqual(1);
    expect(overviewRes.body.stats.totalNews).toBeGreaterThanOrEqual(6);

    const usersRes = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(usersRes.status).toBe(200);
    expect(usersRes.body.items.length).toBeGreaterThanOrEqual(1);

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
