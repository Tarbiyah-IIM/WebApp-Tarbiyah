import { expect, test } from './auth.fixture.js';

test('admin manages study program lecturers with photo cleanup and syncs leadership/profile live', async ({
  page,
  loginViaApi,
  request
}) => {
  const admin = await loginViaApi('tarbiyah@iim.ac.id');
  const headers = { Authorization: `Bearer ${admin.accessToken}` };
  const lecturerName = 'Dr. E2E Ahmad Darmawan, S.Pd., M.A.B.';
  let createdLecturerId = null;

  try {
    await page.goto('/admin');
    await page.getByRole('button', { name: /Dosen & Pimpinan/ }).click();
    await page.getByTestId('admin-add-lecturer').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const chooserPromise = page.waitForEvent('filechooser');
    await dialog.getByRole('button', { name: 'Unggah Foto' }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles({
      name: 'lecturer-portrait.png',
      mimeType: 'image/png',
      buffer: pngBuffer
    });
    const photoUrlInput = dialog.getByPlaceholder('Atau tempel URL foto (/api/v1/media/... atau https://)');
    await expect(photoUrlInput).toHaveValue(/^\/api\/v1\/media\/[0-9a-f-]{36}$/i);
    const uploadedPhotoUrl = await photoUrlInput.inputValue();

    await dialog.getByLabel('Program Studi').selectOption('pai');
    await dialog.getByLabel('Status Mengajar').selectOption('active');
    await dialog.getByLabel(/Nama Lengkap & Gelar/).fill(lecturerName);
    await dialog.getByLabel(/NIDN/).fill('2101018501');
    await dialog.getByLabel('Jenis Pegawai').fill('Dosen Tetap Yayasan');
    await dialog.getByLabel('Jabatan Akademik').fill('Lektor Kepala');
    await dialog.getByLabel('Golongan').fill('IV/A');
    await dialog.getByLabel(/Jabatan Pimpinan Prodi/).fill('Ketua Program Studi');
    await dialog.getByLabel('Email Institusi').fill('darmawan.e2e@iim.ac.id');
    await dialog.getByLabel('Pendidikan Terakhir').fill('S3 | Pendidikan Agama Islam');
    await dialog.getByLabel(/Bidang Keahlian/).fill('Manajemen Pendidikan Islam');
    await dialog.getByLabel('Link Google Scholar').fill('https://scholar.google.com/citations?user=e2etest');
    await dialog.getByLabel('Link SINTA').fill('https://sinta.kemdikbud.go.id/authors/profile/e2etest');
    await dialog.getByLabel('Link ORCID').fill('https://orcid.org/0000-0000-0000-0001');
    await dialog.getByLabel('Biografi Singkat').fill('Mengajar sejak 2010 pada bidang manajemen pendidikan Islam.');

    await dialog.getByRole('button', { name: 'Simpan Profil Dosen' }).click();
    await expect(page.getByText('Data dosen disimpan & disinkronkan.')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('admin-lecturer-grid')).toContainText(lecturerName);

    const listRes = await request.get('http://localhost:3001/api/v1/admin/lecturers', { headers });
    const found = (await listRes.json()).items.find((item) => item.name === lecturerName);
    expect(found).toBeTruthy();
    createdLecturerId = found.id;

    await page.goto('/program-studi/pai');
    await page.getByTestId('prodi-leadership-link').click();
    await expect(page).toHaveURL(/\/program-studi\/pai\/dosen\?filter=pimpinan/);
    const card = page.getByTestId('lecturer-card').filter({ hasText: lecturerName });
    await expect(card).toBeVisible();
    await expect(card).toContainText('Ketua Program Studi');
    await expect(card).toContainText('Aktif Mengajar');
    await card.getByRole('link', { name: 'Lihat Profil' }).click();

    await expect(page).toHaveURL(new RegExp(`/program-studi/pai/dosen/${createdLecturerId}`));
    await expect(page.getByRole('heading', { level: 1, name: `Profil ${lecturerName}` })).toBeVisible();
    await expect(page.locator(`img[alt="${lecturerName}"]`)).toHaveAttribute('src', uploadedPhotoUrl);
    await expect(page.getByRole('link', { name: 'Google Scholar' })).toHaveAttribute(
      'href',
      'https://scholar.google.com/citations?user=e2etest'
    );
    await expect(page.getByRole('link', { name: 'SINTA' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ORCID' })).toBeVisible();
    await expect(page.getByText('Lektor Kepala | IV/A')).toBeVisible();
    await expect(page.getByText('S3 | Pendidikan Agama Islam')).toBeVisible();
    await expect(page.getByText('Mengajar sejak 2010 pada bidang manajemen pendidikan Islam.')).toBeVisible();

    await page.getByTestId('search-toggle').click();
    const searchDialog = page.getByRole('dialog', { name: 'Pencarian Cepat Tarbiyah' });
    await searchDialog.getByTestId('global-search-input').fill('Ahmad Darmawan');
    await expect(searchDialog.getByText('Dosen & Pimpinan Prodi')).toBeVisible();
    await searchDialog.getByRole('button', { name: new RegExp(lecturerName) }).click();
    await expect(page).toHaveURL(new RegExp(`/program-studi/pai/dosen/${createdLecturerId}`));

    await page.goto('/admin');
    await page.getByRole('button', { name: /Dosen & Pimpinan/ }).click();
    const adminCard = page.locator('[data-testid="admin-lecturer-grid"] article').filter({ hasText: lecturerName });
    await adminCard.getByRole('button', { name: 'Hapus' }).click();
    const confirmModal = page.getByRole('dialog');
    await expect(confirmModal).toContainText(lecturerName);
    await confirmModal.getByRole('button', { name: 'Ya, Hapus' }).click();
    await expect(page.getByText('Data dosen dihapus.')).toBeVisible();
    createdLecturerId = null;

    await expect.poll(async () => (await page.request.get(uploadedPhotoUrl)).status()).toBe(404);
  } finally {
    if (createdLecturerId) {
      await request.delete(`http://localhost:3001/api/v1/admin/lecturers/${createdLecturerId}`, { headers });
    } else {
      const cleanupRes = await request.get('http://localhost:3001/api/v1/admin/lecturers', { headers });
      if (cleanupRes.ok()) {
        const { items = [] } = await cleanupRes.json();
        for (const item of items) {
          if (item.name === lecturerName) {
            await request.delete(`http://localhost:3001/api/v1/admin/lecturers/${item.id}`, { headers });
          }
        }
      }
    }
  }
});
