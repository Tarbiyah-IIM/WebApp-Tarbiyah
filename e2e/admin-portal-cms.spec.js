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

test('admin uploads news image directly to MySQL and displays it on homepage', async ({ page, loginViaApi, request }) => {
  const admin = await loginViaApi('tarbiyah@iim.ac.id');
  const headers = { Authorization: `Bearer ${admin.accessToken}` };
  let createdNewsId = null;

  try {
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Berita', exact: true }).click();
    await page.getByRole('button', { name: 'Tambah Berita' }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const fileChooserPromise = page.waitForEvent('filechooser');
    await dialog.getByRole('button', { name: 'Pilih Gambar' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'e2e-news.png',
      mimeType: 'image/png',
      buffer: pngBuffer
    });

    const imgInput = dialog.getByLabel('Atau Tempel URL Gambar (Opsional)');
    await expect(imgInput).toHaveValue(/^\/api\/v1\/media\/[0-9a-f-]{36}$/i);
    const mediaUrl = await imgInput.inputValue();

    const newsTitle = `E2E Berita MySQL ${Date.now()}`;
    await dialog.getByLabel(/Nama Dokumen \/ Judul/).fill(newsTitle);
    await dialog.getByLabel(/Tanggal Berita/).fill('2026-11-23');

    const galleryChooserPromise = page.waitForEvent('filechooser');
    await dialog.getByRole('button', { name: 'Pilih Banyak Foto' }).click();
    const galleryChooser = await galleryChooserPromise;
    await galleryChooser.setFiles([
      { name: 'e2e-gallery-1.png', mimeType: 'image/png', buffer: pngBuffer }
    ]);
    await expect(dialog.getByText(/1 foto dokumentasi terpasang/)).toBeVisible();

    await dialog.getByLabel(/Ringkasan Berita/).fill('Gambar berita tersimpan permanen di tabel MySQL media_files.');
    await dialog.getByLabel(/Isi Berita Lengkap/).fill('Paragraf pembuka artikel E2E.\n\nParagraf penutup artikel E2E.');
    await dialog.getByLabel(/Posisi Slideshow Foto di Artikel/).selectOption('middle');
    await dialog.getByLabel(/Tautan Terkait/).fill('https://ft.iim.ac.id/e2e-doc');
    await dialog.getByRole('button', { name: 'Simpan', exact: true }).click();
    await expect(page.getByText('Berita fakultas disimpan & disinkronkan.')).toBeVisible();
    await expect(dialog).toHaveCount(0);

    const listRes = await request.get('http://localhost:3001/api/v1/admin/testimonials', { headers });
    const created = (await listRes.json()).items.find((item) => item.name === newsTitle);
    expect(created).toBeTruthy();
    expect(created.job_title).toBe('23 November 2026');
    expect(created.slideshow_position).toBe('middle');
    expect(created.gallery_urls.length).toBe(1);
    createdNewsId = created.id;

    await page.goto('/');
    const renderedImg = page.locator(`img[alt="${newsTitle}"]`);
    await expect(renderedImg).toBeVisible();
    await expect(renderedImg).toHaveAttribute('src', mediaUrl);
    await page.reload();
    await expect(renderedImg).toBeVisible();

    const mediaFetch = await page.request.get(mediaUrl);
    expect(mediaFetch.status()).toBe(200);
    const galleryFetch = await page.request.get(created.gallery_urls[0]);
    expect(galleryFetch.status()).toBe(200);

    await page.getByRole('button', { name: new RegExp(newsTitle) }).click();
    await expect(page).toHaveURL(/\/$/);
    const articleDialog = page.getByRole('dialog');
    await expect(articleDialog).toBeVisible();
    await expect(articleDialog.getByRole('button', { name: 'Close modal' })).toBeVisible();
    await expect(articleDialog.getByText('Paragraf pembuka artikel E2E.')).toBeVisible();
    await expect(articleDialog.getByRole('heading', { name: 'Dokumentasi Kegiatan' })).toBeVisible();
    await expect(articleDialog.getByText('Paragraf penutup artikel E2E.')).toBeVisible();
    await articleDialog.getByRole('button', { name: 'Close modal' }).click();
    await expect(articleDialog).toHaveCount(0);
  } finally {
    if (createdNewsId) {
      await request.delete(`http://localhost:3001/api/v1/admin/testimonials/${createdNewsId}`, { headers });
    }
  }
});
