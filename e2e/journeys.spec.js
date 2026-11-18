import { test, expect } from './auth.fixture.js';

test.describe('Meekoo Critical User Journeys', () => {
  test('J1: Landing page 11 sections, category filter, Load More, and catalog empty state', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Selamat Datang di Fakultas Tarbiyah');
    await expect(page.getByText('Become Future Educators with Global Impact')).toBeVisible();
    await expect(page.getByText('#1 Online Course 2025')).toHaveCount(0);
    await expect(page.getByText('Best Collaboration')).toHaveCount(0);
    await expect(page.getByText('Courses Designed for Success')).toBeVisible();
    await expect(page.getByText('Tarbiyah dalam Angka')).toBeVisible();
    await expect(page.getByText('Lembaga Akreditasi Mandiri Kependidikan')).toBeVisible();
    await expect(page.getByText('Mahasiswa Aktif')).toBeVisible();
    await expect(page.getByText('Total Alumni')).toBeVisible();
    await expect(page.getByText('Doktor (S3)')).toBeVisible();
    await expect(page.getByText('Top Mentors')).toHaveCount(0);
    await expect(page.getByText('Graduation Rate')).toBeVisible();
    await expect(page.getByText('47+')).toBeVisible();
    await expect(page.getByText('academic system')).toBeVisible();
    await expect(page.getByText('Academic Program')).toBeVisible();
    await expect(page.getByText('Alasan Kuliah')).toBeVisible();
    await expect(page.getByText('Kenapa Harus Kuliah di Fakultas Tarbiyah?')).toBeVisible();
    await expect(page.getByText('Belajar dalam lingkungan kampus yang mendukung pengembangan intelektual, spiritual, karakter, dan kreativitas mahasiswa.')).toBeVisible();
    await expect(page.getByText('Pendidikan Berbasis Nilai-Nilai Islam.')).toBeVisible();
    await expect(page.getByText('Pendidikan Agama Islam')).toBeVisible();
    await expect(page.getByText('Pendidikan Guru Madrasah Ibtidaiyah')).toBeVisible();
    await expect(page.getByText('Pendidikan Islam Anak Usia Dini')).toBeVisible();
    await expect(page.getByText('Weekly Skill Growth')).toHaveCount(0);
    await expect(page.getByText('Course Progress')).toHaveCount(0);
    await expect(page.getByText('Meet Our Expert Mentors')).toBeVisible();
    await expect(page.getByText('What Our Learners Are Saying')).toBeVisible();
    await expect(page.getByText('Frequently Asked Questions')).toBeVisible();

    const loadMoreBtn = page.getByRole('button', { name: /Load More Courses/i });
    await expect(loadMoreBtn).toBeVisible();
    await loadMoreBtn.click();
    await expect(page.locator('#courses-section article')).toHaveCount(12);

    await page.getByRole('tab', { name: 'Web Development' }).click();
    await expect(page.locator('#courses-section article')).toHaveCount(2);

    await page.goto('/courses');
    await page.getByLabel('Search courses').fill('zzznonexistentcourse999');
    await page.getByRole('button', { name: 'Filter' }).click();
    await expect(page.getByText('No matching courses found')).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('J2: Auth register, invalid password failure state, and RBAC route guard', async ({ page, createIsolatedStudent }) => {
    const student = await createIsolatedStudent('E2E Auth Student');

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel('Email').fill(student.email);
    await page.getByLabel('Password').fill('WrongPass!');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('alert')).toContainText('Email atau password salah');

    await page.getByLabel('Password').fill(student.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('J3: Checkout sandbox failed and paid states sync to Student Dashboard', async ({ page, createIsolatedStudent }) => {
    const student = await createIsolatedStudent('E2E Checkout Student');

    await page.goto('/login');
    await page.evaluate((token) => {
      localStorage.setItem('meekoo_token', token);
    }, student.accessToken);

    await page.goto('/courses/strategic-brand-communication');
    await page.getByRole('button', { name: 'Enroll Now' }).click();
    await expect(page).toHaveURL(/\/checkout/);

    await page.getByRole('button', { name: /Proceed to Sandbox Payment/i }).click();
    await expect(page.getByText('Sandbox Payment Gateway')).toBeVisible();

    await page.getByRole('button', { name: /Simulate Failed/i }).click();
    await expect(page.getByText('failed', { exact: true }).first()).toBeVisible();

    await page.goto('/courses/strategic-brand-communication');
    await page.getByRole('button', { name: 'Enroll Now' }).click();
    await page.getByRole('button', { name: /Proceed to Sandbox Payment/i }).click();
    await page.getByRole('button', { name: /Simulate Payment Success/i }).click();

    await expect(page.getByText(/Payment confirmed/i)).toBeVisible();
    await page.getByRole('link', { name: 'Go to Student Dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Strategic Brand Communication & Storytelling').first()).toBeVisible();
  });

  test('J4: Learn video player, 100% progress, certificate generation & verification', async ({ page, request, createIsolatedStudent }) => {
    const student = await createIsolatedStudent('E2E Graduate');

    const orderRes = await request.post('http://localhost:3001/api/v1/orders', {
      headers: { Authorization: `Bearer ${student.accessToken}` },
      data: { orderType: 'course', courseIds: [3] }
    });
    const orderData = await orderRes.json();
    await request.post(`http://localhost:3001/api/v1/orders/${orderData.order.id}/simulate-payment`, {
      headers: { Authorization: `Bearer ${student.accessToken}` },
      data: { outcome: 'paid' }
    });

    await page.goto('/login');
    await page.evaluate((token) => {
      localStorage.setItem('meekoo_token', token);
    }, student.accessToken);

    await page.goto('/learn/3');
    await expect(page.getByRole('heading', { name: /Strategic Brand Communication/i })).toBeVisible();

    await page.getByRole('button', { name: /Mark Completed/i }).click();
    await expect(page.getByText('50%', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Mark Completed/i }).click();

    await expect(page.getByText('Certificate Earned!')).toBeVisible();
    await page.getByRole('link', { name: 'View Certificate' }).click();
    await expect(page.getByText('Verified Official Meekoo Certificate')).toBeVisible();
    await expect(page.getByText('E2E Graduate')).toBeVisible();

    await page.goto('/verify-certificate?code=INVALID-CODE-000');
    await expect(page.getByRole('alert')).toContainText('tidak ditemukan');
  });

  test('J5: Mentor creates & submits course -> Admin approves -> appears in catalog -> cleanup', async ({ page, request, loginViaApi }) => {
    const uniqueTitle = `E2E Synced Course ${Date.now()}`;
    await loginViaApi('sarah@meekoo.test');
    await page.goto('/mentor');

    await page.getByRole('button', { name: 'New Course' }).click();
    await page.locator('form input[type="text"]').first().fill(uniqueTitle);
    await page.locator('form textarea').fill('End-to-end synchronized course description for testing.');
    await page.getByRole('button', { name: 'Save Course' }).click();

    const row = page.locator('tr', { hasText: uniqueTitle });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Submit' }).click();
    await expect(row).toContainText('pending_review');

    const adminAuth = await loginViaApi('admin@meekoo.test');
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Catalog & Approvals' }).click();

    const adminRow = page.locator('tr', { hasText: uniqueTitle });
    await expect(adminRow).toBeVisible();
    await adminRow.getByRole('button', { name: 'Approve' }).click();
    await expect(adminRow).toContainText('approved');

    await page.goto('/courses');
    await page.getByLabel('Search courses').fill(uniqueTitle);
    await page.getByRole('button', { name: 'Filter' }).click();
    await expect(page.getByText(uniqueTitle)).toBeVisible();

    const coursesList = await request.get('http://localhost:3001/api/v1/admin/courses', {
      headers: { Authorization: `Bearer ${adminAuth.accessToken}` }
    });
    const { items } = await coursesList.json();
    const created = items.find((c) => c.title === uniqueTitle);
    if (created) {
      await request.delete(`http://localhost:3001/api/v1/admin/courses/${created.id}`, {
        headers: { Authorization: `Bearer ${adminAuth.accessToken}` }
      });
    }
  });

  test('J6: Admin Landing CMS updates Hero Title and syncs immediately to Home', async ({ page, loginViaApi }) => {
    await loginViaApi('admin@meekoo.test');
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Landing Page CMS' }).click();

    const titleInput = page.getByLabel('Hero Title');
    await expect(titleInput).toHaveValue(/.+/);
    const originalTitle = await titleInput.inputValue();
    const updatedTitle = 'E2E Synced Hero Title 2026';

    await titleInput.fill(updatedTitle);
    await page.getByRole('button', { name: 'Save & Sync Landing' }).click();
    await expect(page.getByText('Site settings saved & landing page updated!')).toBeVisible();

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(updatedTitle);

    await page.goto('/admin');
    await page.getByRole('button', { name: 'Landing Page CMS' }).click();
    const restoreInput = page.getByLabel('Hero Title');
    await expect(restoreInput).toHaveValue(/.+/);
    await restoreInput.fill(originalTitle);
    await page.getByRole('button', { name: 'Save & Sync Landing' }).click();
    await expect(page.getByText('Site settings saved & landing page updated!')).toBeVisible();
  });
});
