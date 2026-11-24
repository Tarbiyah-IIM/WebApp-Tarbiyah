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
    expect(res.body.partners.find((p) => p.name === 'Jurnal Tarbiyah')?.url).toBe('/publikasi/jurnal');
    expect(res.body.stats.hero.some((s) => s.label === 'Academic System')).toBe(true);
    expect(res.body.stats.journey.some((s) => s.label === 'Dosen')).toBe(true);
    expect(Array.isArray(res.body.testimonials)).toBe(true);
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
    expect(overviewRes.body.stats.totalNews).toBeGreaterThanOrEqual(0);

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

    const badJsonRes = await request(app)
      .patch('/api/v1/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ cms_nav_links: '{invalid-json' });
    expect(badJsonRes.status).toBe(400);

    const badUrlRes = await request(app)
      .patch('/api/v1/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ cms_nav_links: JSON.stringify({ calendar: 'javascript:alert(1)' }) });
    expect(badUrlRes.status).toBe(400);

    const badGuestUrlRes = await request(app)
      .patch('/api/v1/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ cms_contacts: JSON.stringify({ guestLectureUrl: 'https://evil.example.com/form' }) });
    expect(badGuestUrlRes.status).toBe(400);

    const originalNav = beforeLanding.body.settings.cms_nav_links ?? '';
    const validCmsRes = await request(app)
      .patch('/api/v1/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ cms_nav_links: JSON.stringify({ calendar: 'https://ft.iim.ac.id/kalender-test' }) });
    expect(validCmsRes.status).toBe(200);

    const syncedLanding = await request(app).get('/api/v1/landing');
    expect(syncedLanding.body.settings.cms_nav_links).toContain('https://ft.iim.ac.id/kalender-test');

    await request(app)
      .patch('/api/v1/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ cms_nav_links: originalNav });

    const spoofedRes = await request(app)
      .post('/api/v1/admin/uploads')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('not-a-valid-png-binary'), {
        filename: 'fake.png',
        contentType: 'image/png'
      });
    expect(spoofedRes.status).toBe(400);

    const png1x1 = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const uploadRes = await request(app)
      .post('/api/v1/admin/uploads')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', png1x1, { filename: 'pixel.png', contentType: 'image/png' });
    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.storage).toBe('mysql');
    expect(uploadRes.body.url).toMatch(/^\/api\/v1\/media\/[0-9a-f-]{36}$/i);

    const mediaRes = await request(app).get(uploadRes.body.url);
    expect(mediaRes.status).toBe(200);
    expect(mediaRes.headers['content-type']).toContain('image/png');
    expect(Buffer.compare(mediaRes.body, png1x1)).toBe(0);

    const categoriesRes = await request(app)
      .get('/api/v1/admin/news-categories')
      .set('Authorization', `Bearer ${adminToken}`);
    const firstCatId = categoriesRes.body.items[0].id;
    const secondCatId = categoriesRes.body.items[1]?.id || firstCatId;

    const galleryUploadRes = await request(app)
      .post('/api/v1/admin/uploads')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', png1x1, { filename: 'gallery.png', contentType: 'image/png' });
    expect(galleryUploadRes.status).toBe(201);

    const newsCreateRes = await request(app)
      .post('/api/v1/admin/testimonials')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Berita Media MySQL Test',
        jobTitle: '23 November 2026',
        quote: 'Pengujian penyimpanan permanen gambar berita di MySQL.',
        fullContent: 'Paragraf pertama artikel lengkap.\n\nParagraf kedua untuk detail berita.',
        avatarUrl: uploadRes.body.url,
        galleryUrls: [galleryUploadRes.body.url],
        slideshowPosition: 'middle',
        relatedUrl: 'https://ft.iim.ac.id/dokumen-test',
        categoryIds: firstCatId !== secondCatId ? [firstCatId, secondCatId] : [firstCatId],
        isVisible: true,
        sortOrder: 0
      });
    expect(newsCreateRes.status).toBe(201);
    expect(newsCreateRes.body.testimonial.gallery_urls).toEqual([galleryUploadRes.body.url]);
    expect(newsCreateRes.body.testimonial.slideshow_position).toBe('middle');
    expect(newsCreateRes.body.testimonial.related_url).toBe('https://ft.iim.ac.id/dokumen-test');

    const landingRes = await request(app).get('/api/v1/landing');
    expect(landingRes.status).toBe(200);
    const createdLandingItem = landingRes.body.testimonials.find(
      (item) => item.id === newsCreateRes.body.testimonial.id
    );
    expect(createdLandingItem.full_content).toContain('Paragraf pertama artikel lengkap.');
    expect(createdLandingItem.slideshow_position).toBe('middle');
    expect(createdLandingItem.gallery_urls).toEqual([galleryUploadRes.body.url]);
    expect(createdLandingItem.categories.length).toBe(firstCatId !== secondCatId ? 2 : 1);

    const delNewsRes = await request(app)
      .delete(`/api/v1/admin/testimonials/${newsCreateRes.body.testimonial.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(delNewsRes.status).toBe(200);

    const removedMediaRes = await request(app).get(uploadRes.body.url);
    expect(removedMediaRes.status).toBe(404);
    const removedGalleryRes = await request(app).get(galleryUploadRes.body.url);
    expect(removedGalleryRes.status).toBe(404);
  });

  it('serves stateless PPL work-permit metadata and validates submit payload without SQL bloat', async () => {
    const metaRes = await request(app).get('/api/v1/permits/work-permit/meta');
    expect(metaRes.status).toBe(200);
    expect(metaRes.body.ok).toBe(true);
    expect(metaRes.body.data.tahun_akademik).toMatch(/^\d{4}\/\d{4}$/);
    expect(metaRes.body.data.program_studi_options).toContain('Pendidikan Agama Islam');
    expect(metaRes.body.data.semester_options).toContain('7');

    const invalidRes = await request(app)
      .post('/api/v1/permits/work-permit')
      .send({ kepada: '', nim: '1', program_studi: 'Invalid' });
    expect(invalidRes.status).toBe(400);
  });

  it('orders news newest-first by year, month, and day on both landing and admin APIs', async () => {
    const categoriesRes = await request(app)
      .get('/api/v1/admin/news-categories')
      .set('Authorization', `Bearer ${adminToken}`);
    const catId = categoriesRes.body.items[0].id;
    const createdIds = [];

    const samples = [
      { title: 'Sort Test Oldest 2021', date: '10 November 2021' },
      { title: 'Sort Test Mid 2022', date: '14 Desember 2022' },
      { title: 'Sort Test Early May 2023', date: '2 Mei 2023' },
      { title: 'Sort Test Late May 2023', date: '20 Mei 2023' }
    ];

    try {
      for (const sample of samples) {
        const res = await request(app)
          .post('/api/v1/admin/testimonials')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: sample.title,
            jobTitle: sample.date,
            quote: `Ringkasan uji urutan tanggal untuk ${sample.title}.`,
            categoryIds: [catId],
            isVisible: true,
            sortOrder: 0
          });
        expect(res.status).toBe(201);
        createdIds.push(res.body.testimonial.id);
      }

      const [adminRes, landingRes] = await Promise.all([
        request(app).get('/api/v1/admin/testimonials').set('Authorization', `Bearer ${adminToken}`),
        request(app).get('/api/v1/landing')
      ]);
      expect(adminRes.status).toBe(200);
      expect(landingRes.status).toBe(200);

      const expectedOrder = [
        'Sort Test Late May 2023',
        'Sort Test Early May 2023',
        'Sort Test Mid 2022',
        'Sort Test Oldest 2021'
      ];
      const adminOrder = adminRes.body.items
        .map((item) => item.name)
        .filter((name) => expectedOrder.includes(name));
      const landingOrder = landingRes.body.testimonials
        .map((item) => item.name)
        .filter((name) => expectedOrder.includes(name));

      expect(adminOrder).toEqual(expectedOrder);
      expect(landingOrder).toEqual(expectedOrder);
    } finally {
      for (const id of createdIds) {
        await request(app).delete(`/api/v1/admin/testimonials/${id}`).set('Authorization', `Bearer ${adminToken}`);
      }
    }
  });
});
