import { expect, test } from './auth.fixture.js';

test('admin workspace shell syncs menu links and portal pages live to public routes', async ({ page, loginViaApi, request }) => {
  const admin = await loginViaApi('tarbiyah@iim.ac.id');
  const headers = { Authorization: `Bearer ${admin.accessToken}` };

  const initialSettingsRes = await request.get('http://localhost:3001/api/v1/admin/settings', { headers });
  expect(initialSettingsRes.ok()).toBeTruthy();
  const initialSettings = (await initialSettingsRes.json()).settings || {};
  const originalNav = initialSettings.cms_nav_links ?? '';
  const originalPrograms = initialSettings.cms_programs ?? '';

  try {
    await page.goto('/admin');

    await expect(page.getByRole('navigation', { name: 'Main Navigation' })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Menu admin' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu & Kontak', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Halaman Portal', exact: true })).toBeVisible();

    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.getByRole('button', { name: 'Menu & Kontak', exact: true }).click();
    const calendarInput = page.getByLabel('Akademik — Kalender Akademik');
    await calendarInput.fill('https://ft.iim.ac.id/kalender-2026');
    await page.getByRole('button', { name: 'Simpan Menu Navigasi' }).click();
    await expect(page.getByText('Tautan menu navigasi disimpan & disinkronkan!')).toBeVisible();

    await page.getByRole('button', { name: 'Halaman Portal', exact: true }).click();
    const badgeInput = page.getByLabel('Badge / Status Akreditasi');
    await badgeInput.fill('Akreditasi Unggul E2E');
    await page.getByRole('button', { name: 'Simpan Halaman Ini' }).click();
    await expect(page.getByText('Konten halaman portal disimpan & disinkronkan!')).toBeVisible();

    await page.goto('/');
    const mainNav = page.getByRole('navigation', { name: 'Main Navigation' });
    await mainNav.getByRole('button', { name: 'Akademik' }).click();
    await expect(mainNav.getByRole('link', { name: 'Kalender Akademik' })).toHaveAttribute(
      'href',
      'https://ft.iim.ac.id/kalender-2026'
    );

    await page.goto('/program-studi/pai');
    await expect(page.getByText('Akreditasi Unggul E2E').first()).toBeVisible();
    await page.reload();
    await expect(page.getByText('Akreditasi Unggul E2E').first()).toBeVisible();

    await page.goto('/admin');
    await page.getByRole('button', { name: 'Halaman Portal', exact: true }).click();
    await page.getByRole('button', { name: 'Kembalikan Default' }).click();
    await expect(page.getByText('Halaman dikembalikan ke konten bawaan.')).toBeVisible();
  } finally {
    await request.patch('http://localhost:3001/api/v1/admin/settings', {
      headers,
      data: {
        cms_nav_links: originalNav,
        cms_programs: originalPrograms
      }
    });
  }
});
