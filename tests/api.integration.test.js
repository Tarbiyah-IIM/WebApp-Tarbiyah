import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import app from '../server/app.js';
import { setCache } from '../server/config/cache.js';
import { pool } from '../server/config/db.js';
import { env, resolveJwtAccessSecret } from '../server/config/env.js';
import { isSafeHttpUrl } from '../server/utils/security.js';
import {
  createUser,
  deleteUserById,
  findUserByEmail,
  updateUserPassword
} from '../server/models/user.model.js';

describe('Fakultas Tarbiyah Portal Integration & Sync Suite', () => {
  const testEmail = `test.${Date.now()}@tarbiyah.test`;
  const testAdminEmail = `test.admin.${Date.now()}@tarbiyah.test`;
  const testAdminPassword = `Adm!${crypto.randomBytes(12).toString('hex')}`;
  let userToken = '';
  let adminToken = '';
  let createdTestAdminId = null;
  let originalFetch = null;

  beforeAll(async () => {
    const isTestDb = env.db.database.endsWith('_test');
    if (env.nodeEnv !== 'test' || (!isTestDb && process.env.ALLOW_LIVE_DB_TEST !== 'true')) {
      throw new Error(
        `Refusing to run integration tests against "${env.db.database}" (${env.nodeEnv}). Use *_test DB or set ALLOW_LIVE_DB_TEST=true intentionally.`
      );
    }

    originalFetch = globalThis.fetch;
    vi.stubGlobal('fetch', async (url, init) => {
      const targetUrl = String(url || '');
      if (targetUrl.startsWith('https://script.google.com/')) {
        if (targetUrl.includes('api=meta')) {
          return new Response(
            JSON.stringify({
              ok: true,
              data: {
                system_status: 'OPEN',
                tahun_akademik: '2026/2027',
                tanggal_bulan_tahun: '25 November 2026',
                program_studi_options: [
                  'Pendidikan Agama Islam',
                  'Pendidikan Guru Madrasah Ibtidaiyah',
                  'Pendidikan Islam Anak Usia Dini'
                ],
                semester_options: ['1', '2', '3', '4', '5', '6', '7', '8']
              }
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (targetUrl.includes('api=data')) {
          return new Response(
            JSON.stringify({
              success: true,
              prodiList: ['PAI', 'PIAUD', 'PGMI'],
              dosenList: ['Dosen Uji'],
              incompleteLectures: [{ rowIndex: 99, prodi: 'PAI', mataKuliah: 'Uji MK', status: 'Not Started' }],
              trackingLectures: []
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({
            ok: true,
            success: true,
            isComplete: true,
            status: 'Process',
            message: 'Mock Apps Script OK',
            rowIndex: 100
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return originalFetch(url, init);
    });

    const passwordHash = await bcrypt.hash(testAdminPassword, 10);
    const createdAdmin = await createUser({
      name: 'Isolated Admin Test',
      email: testAdminEmail,
      passwordHash,
      role: 'admin',
      avatarUrl: null
    });
    createdTestAdminId = createdAdmin.id;
  });

  afterAll(async () => {
    if (originalFetch) {
      vi.unstubAllGlobals();
    }
    if (userToken) {
      await request(app).delete('/api/v1/me').set('Authorization', `Bearer ${userToken}`);
    }
    if (createdTestAdminId) {
      await deleteUserById(createdTestAdminId);
    }
    await pool.end();
  });

  it('returns complete synchronized landing page bundle and excludes removed course endpoints', async () => {
    const res = await request(app).get('/api/v1/landing');
    expect(res.status).toBe(200);
    const cspHeader = String(res.headers['content-security-policy'] || '');
    expect(cspHeader).toContain('https://drive.google.com');
    expect(cspHeader).toContain('https://script.google.com');
    expect(cspHeader).toContain('https://www.google.com/maps');
    expect(res.body.settings.hero_title).toBeTruthy();
    expect(res.body.stats.hero.length).toBeGreaterThanOrEqual(4);
    expect(res.body.stats.journey.length).toBeGreaterThanOrEqual(4);
    expect(res.body.features.length).toBeGreaterThanOrEqual(4);
    expect(res.body.partners.length).toBe(5);
    expect(res.body.partners.find((p) => p.name === 'Jurnal Tarbiyah')?.url).toBe('/publikasi/jurnal');
    expect(res.body.stats.hero.some((s) => s.label === 'Academic System')).toBe(true);
    expect(res.body.stats.journey.some((s) => s.label === 'Dosen')).toBe(true);
    expect(Array.isArray(res.body.testimonials)).toBe(true);
    expect(Array.isArray(res.body.agendas)).toBe(true);
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

    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: testAdminEmail,
      password: testAdminPassword
    });
    expect(adminLogin.status).toBe(200);
    expect(adminLogin.body.user.role).toBe('admin');
    adminToken = adminLogin.body.accessToken;

    const noCurrentPass = await request(app)
      .patch('/api/v1/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ newPassword: 'NewPassword123!' });
    expect(noCurrentPass.status).toBe(400);

    const selfDeleteAdmin = await request(app)
      .delete('/api/v1/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(selfDeleteAdmin.status).toBe(403);

    const selfSuspendAdmin = await request(app)
      .patch(`/api/v1/admin/users/${createdTestAdminId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin', isActive: false });
    expect(selfSuspendAdmin.status).toBe(400);

    const existingRealAdmin = await findUserByEmail('tarbiyah@iim.ac.id');
    const preservedRealAdminHash = existingRealAdmin?.password_hash || '';

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
      if (existingRealAdmin && preservedRealAdminHash) {
        await updateUserPassword(existingRealAdmin.id, preservedRealAdminHash);
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

    const oversizedBuffer = Buffer.alloc(10 * 1024 * 1024 + 1024, 0);
    oversizedBuffer[0] = 0x89;
    oversizedBuffer[1] = 0x50;
    oversizedBuffer[2] = 0x4e;
    oversizedBuffer[3] = 0x47;
    const oversizedRes = await request(app)
      .post('/api/v1/admin/uploads')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', oversizedBuffer, {
        filename: 'oversized.png',
        contentType: 'image/png'
      });
    expect(oversizedRes.status).toBe(400);
    expect(oversizedRes.body.error.code).toBe('UPLOAD_ERROR');
    expect(oversizedRes.body.error.message).toContain('10 MB');

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
        fullContent: 'Paragraf pertama artikel lengkap.\n\nParagraf kedua untuk detail berita.',
        avatarUrl: uploadRes.body.url,
        galleryUrls: [galleryUploadRes.body.url],
        slideshowPosition: 'middle',
        categoryIds: firstCatId !== secondCatId ? [firstCatId, secondCatId] : [firstCatId],
        isVisible: true,
        sortOrder: 0
      });
    expect(newsCreateRes.status).toBe(201);
    expect(newsCreateRes.body.testimonial.quote).toContain('Paragraf pertama artikel lengkap.');
    expect(newsCreateRes.body.testimonial.gallery_urls).toEqual([galleryUploadRes.body.url]);
    expect(newsCreateRes.body.testimonial.slideshow_position).toBe('middle');

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

  it('supports Agenda CRUD, newest-first ordering, and automatic MySQL media cleanup', async () => {
    const png1x1 = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const coverUpload = await request(app)
      .post('/api/v1/admin/uploads')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', png1x1, { filename: 'agenda-cover.png', contentType: 'image/png' });
    expect(coverUpload.status).toBe(201);

    const createdAgendaIds = [];
    try {
      const oldAgenda = await request(app)
        .post('/api/v1/admin/agendas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Agenda Lama 2024',
          eventDate: '12 Januari 2024',
          eventTime: '08.00 - 11.00 WIB',
          description: 'Deskripsi lengkap agenda tahun 2024 untuk pengujian urutan.',
          isVisible: true
        });
      expect(oldAgenda.status).toBe(201);
      createdAgendaIds.push(oldAgenda.body.agenda.id);

      const newAgenda = await request(app)
        .post('/api/v1/admin/agendas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Agenda Terbaru 2026',
          eventDate: '25 November 2026',
          eventTime: '09.00 - 12.00 WIB',
          description: 'Deskripsi lengkap agenda terbaru tahun 2026 dengan gambar cover MySQL.',
          coverUrl: coverUpload.body.url,
          isVisible: true
        });
      expect(newAgenda.status).toBe(201);
      createdAgendaIds.push(newAgenda.body.agenda.id);

      const [adminRes, landingRes] = await Promise.all([
        request(app).get('/api/v1/admin/agendas').set('Authorization', `Bearer ${adminToken}`),
        request(app).get('/api/v1/landing')
      ]);
      expect(adminRes.status).toBe(200);
      expect(landingRes.status).toBe(200);

      const expectedTitles = ['Agenda Terbaru 2026', 'Agenda Lama 2024'];
      const adminOrder = adminRes.body.items
        .map((item) => item.title)
        .filter((title) => expectedTitles.includes(title));
      const landingOrder = landingRes.body.agendas
        .map((item) => item.title)
        .filter((title) => expectedTitles.includes(title));
      expect(adminOrder).toEqual(expectedTitles);
      expect(landingOrder).toEqual(expectedTitles);

      const delNew = await request(app)
        .delete(`/api/v1/admin/agendas/${newAgenda.body.agenda.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(delNew.status).toBe(200);
      createdAgendaIds.splice(createdAgendaIds.indexOf(newAgenda.body.agenda.id), 1);

      const removedCover = await request(app).get(coverUpload.body.url);
      expect(removedCover.status).toBe(404);
    } finally {
      for (const id of createdAgendaIds) {
        await request(app).delete(`/api/v1/admin/agendas/${id}`).set('Authorization', `Bearer ${adminToken}`);
      }
    }
  });

  it('serves stateless guest-lecture relay metadata and rejects forged updates or spoofed images', async () => {
    const getRes = await request(app).get('/api/v1/guest-lectures');
    expect([200, 502]).toContain(getRes.status);
    expect(getRes.body.scriptUrl).toBeUndefined();

    const emptyPostRes = await request(app).post('/api/v1/guest-lectures').send({ mode: 'new' });
    expect(emptyPostRes.status).toBe(400);

    const missingRowUpdateRes = await request(app)
      .post('/api/v1/guest-lectures')
      .send({ mode: 'update', mataKuliah: 'Uji Validasi' });
    expect(missingRowUpdateRes.status).toBe(400);

    const lockedRowUpdateRes = await request(app)
      .post('/api/v1/guest-lectures')
      .send({ mode: 'update', rowIndex: 9999, mataKuliah: 'Uji Row Terkunci' });
    expect(lockedRowUpdateRes.status).toBe(403);

    const spoofedPhotoRes = await request(app)
      .post('/api/v1/guest-lectures')
      .send({
        mode: 'new',
        mataKuliah: 'Uji Upload Spoof',
        fotoFiles: [
          {
            filename: 'shell.png',
            mimeType: 'image/png',
            base64: Buffer.from('<?php echo "hello"; ?>').toString('base64')
          }
        ]
      });
    expect(spoofedPhotoRes.status).toBe(400);
  });

  it('supports partner CRUD without logoUrl and rejects unsafe partner URLs', async () => {
    const badRes = await request(app)
      .post('/api/v1/admin/partners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Mitra Uji XSS',
        logoUrl: 'javascript:alert(1)',
        url: 'https://iimsurakarta.ac.id',
        sortOrder: 99
      });
    expect(badRes.status).toBe(400);

    const createRes = await request(app)
      .post('/api/v1/admin/partners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Mitra Uji Integrasi',
        url: 'https://iimsurakarta.ac.id',
        sortOrder: 99
      });
    expect(createRes.status).toBe(201);
    const partnerId = createRes.body.partner?.id;
    expect(partnerId).toBeTruthy();

    const updateRes = await request(app)
      .patch(`/api/v1/admin/partners/${partnerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Mitra Uji Integrasi Updated',
        url: 'https://tarbiyah.iimsurakarta.ac.id',
        sortOrder: 100
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.partner?.name).toBe('Mitra Uji Integrasi Updated');

    const deleteRes = await request(app)
      .delete(`/api/v1/admin/partners/${partnerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);
  });

  it('enforces CSP Google Maps frame sources, production JWT placeholder rejection, and URL control sanitization', async () => {
    const healthRes = await request(app).get('/api/v1/health');
    expect(healthRes.status).toBe(200);
    const csp = String(healthRes.headers['content-security-policy'] || '');
    expect(csp).toContain('https://www.google.com/maps');
    expect(csp).toContain('https://www.google.com/maps/');
    expect(csp).toContain('https://maps.google.com');
    expect(csp).toContain('https://maps.google.com/');

    expect(() => resolveJwtAccessSecret('change_me_with_at_least_32_random_hex_chars', 'production')).toThrow();
    expect(() => resolveJwtAccessSecret('replace_me_123456789012345678901234', 'production')).toThrow();
    expect(resolveJwtAccessSecret('b'.repeat(32), 'production')).toBe('b'.repeat(32));

    expect(isSafeHttpUrl('https://example.com/ok')).toBe(true);
    expect(isSafeHttpUrl('https://example.com/a\nb')).toBe(false);
    expect(isSafeHttpUrl('https://example.com/a\rb')).toBe(false);
  });

  it('validates multi-line existingFotoUrl, strips rowIndex on mode new, and suppresses fallbackUrl for private scripts', async () => {
    const unsafeLineRes = await request(app)
      .post('/api/v1/guest-lectures')
      .send({
        mode: 'update',
        rowIndex: 52,
        existingFotoUrl: 'https://drive.google.com/file/d/ok\njavascript:alert(1)'
      });
    expect(unsafeLineRes.status).toBe(400);

    const tooManyLinesRes = await request(app)
      .post('/api/v1/guest-lectures')
      .send({
        mode: 'update',
        rowIndex: 52,
        existingFotoUrl: [
          'https://drive.google.com/file/d/1',
          'https://drive.google.com/file/d/2',
          'https://drive.google.com/file/d/3',
          'https://drive.google.com/file/d/4'
        ].join('\n')
      });
    expect(tooManyLinesRes.status).toBe(400);

    const prevFetch = globalThis.fetch;
    const prevPrivateFlag = env.hasPrivateGuestLectureUrl;
    let capturedPostBody = null;

    try {
      env.hasPrivateGuestLectureUrl = true;

      setCache('guest_lecture_data', null, 0);
      setCache('guest_lecture_source_script', null, 0);
      globalThis.fetch = async () =>
        new Response('<html><body>Deploy notice</body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });

      const deployNoticeRes = await request(app).get('/api/v1/guest-lectures?refresh=1');
      expect(deployNoticeRes.status).toBe(200);
      expect(deployNoticeRes.body.needsAppsScriptDeploy).toBe(true);
      expect(deployNoticeRes.body.fallbackUrl).toBeUndefined();

      setCache('guest_lecture_data', null, 0);
      setCache('guest_lecture_source_script', null, 0);
      globalThis.fetch = async () => new Response('Server error', { status: 500 });

      const upstreamErrRes = await request(app).get('/api/v1/guest-lectures?refresh=1');
      expect(upstreamErrRes.status).toBe(502);
      expect(upstreamErrRes.body.code).toBe('RELAY_TIMEOUT');

      globalThis.fetch = async (_url, init = {}) => {
        capturedPostBody = JSON.parse(String(init.body || '{}'));
        return new Response(
          JSON.stringify({
            success: true,
            isComplete: false,
            status: 'Not Started',
            message: 'Tersimpan',
            rowIndex: 123
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      };

      const newRes = await request(app)
        .post('/api/v1/guest-lectures')
        .send({
          mode: 'new',
          rowIndex: 99,
          prodi: 'PAI',
          mataKuliah: 'Uji Strip RowIndex'
        });
      expect(newRes.status).toBe(201);
      expect(capturedPostBody).toBeTruthy();
      expect(capturedPostBody.rowIndex).toBeNull();
    } finally {
      globalThis.fetch = prevFetch;
      env.hasPrivateGuestLectureUrl = prevPrivateFlag;
      setCache('guest_lecture_data', null, 0);
      setCache('guest_lecture_source_script', null, 0);
    }
  });
});
