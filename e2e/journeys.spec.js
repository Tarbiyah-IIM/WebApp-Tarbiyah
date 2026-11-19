import { test, expect } from './auth.fixture.js';

test.describe('Fakultas Tarbiyah Critical User Journeys', () => {
  test('J1: Landing sections, theme toggle, i18n, global search, /courses removal redirect, and 3x logo login', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    await expect(page).toHaveTitle('Fakultas Tarbiyah | Institut Islam Mambaul Ulum Surakarta');
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.png');
    const mainNav = page.getByLabel('Main Navigation');
    await expect(mainNav.getByAltText('Logo Fakultas Tarbiyah')).toBeVisible();
    await expect(mainNav.getByText('Fakultas Tarbiyah', { exact: true })).toBeVisible();
    await expect(mainNav.getByText('Institut Islam Mambaul Ulum Surakarta', { exact: true })).toBeVisible();
    await expect(mainNav.getByRole('link', { name: 'Tentang Kami' })).toBeVisible();
    await expect(mainNav.getByRole('button', { name: 'Program Studi' })).toBeVisible();
    await expect(mainNav.getByRole('button', { name: 'Akademik' })).toBeVisible();
    await expect(mainNav.getByRole('button', { name: 'Publikasi' })).toBeVisible();
    await expect(mainNav.getByRole('button', { name: 'RPL' })).toBeVisible();
    await expect(mainNav.getByRole('link', { name: 'Login' })).toHaveCount(0);
    await expect(mainNav.getByTestId('search-toggle')).toBeVisible();

    await mainNav.getByRole('button', { name: 'Program Studi' }).click();
    await expect(mainNav.getByRole('link', { name: 'Pendidikan Agama Islam' })).toHaveAttribute(
      'href',
      'https://iimsurakarta.siakadcloud.com/spmbfront/program-studi-detail/detail/86208'
    );
    await expect(mainNav.getByRole('link', { name: 'Pendidikan Guru Madrasah Ibtidaiyah' })).toHaveAttribute(
      'href',
      'https://iimsurakarta.siakadcloud.com/spmbfront/program-studi-detail/detail/86232'
    );
    await expect(mainNav.getByRole('link', { name: 'Pendidikan Islam Anak Usia Dini' })).toHaveAttribute(
      'href',
      'https://iimsurakarta.siakadcloud.com/spmbfront/program-studi-detail/detail/86239'
    );

    await mainNav.getByRole('button', { name: 'Akademik' }).click();
    await expect(mainNav.getByRole('link', { name: 'Surat Aktif Mahasiswa' })).toHaveAttribute(
      'href',
      'https://baau.iim.ac.id/index.php/layanan/surat-aktif-kuliah/'
    );
    await expect(mainNav.getByRole('link', { name: 'Ujian Komprehensif' })).toHaveAttribute(
      'href',
      'https://www.myskripsi.iimsurakarta.ac.id/mylisan/dashboard/ul-f-tarbiyah/'
    );
    await expect(mainNav.getByRole('link', { name: 'Munaqasyah' })).toHaveAttribute(
      'href',
      'https://www.myskripsi.iimsurakarta.ac.id/myskripsi/dashboard/'
    );

    await mainNav.getByRole('button', { name: 'Publikasi' }).click();
    await expect(mainNav.getByRole('button', { name: 'Praktek Pengalaman Lapangan (PPL)' })).toBeVisible();
    await expect(mainNav.getByRole('button', { name: 'Penelitian dan Pengabdian' })).toBeVisible();

    await mainNav.getByRole('button', { name: 'RPL' }).click();
    await expect(mainNav.getByRole('button', { name: 'Pedoman RPL' })).toBeVisible();
    await expect(mainNav.getByRole('button', { name: 'SK Pengelola' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(mainNav.getByRole('button', { name: 'SK Pengelola' })).toHaveCount(0);

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Selamat Datang di Fakultas Tarbiyah');
    await expect(page.getByRole('button', { name: 'Profil', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Beasiswa', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Profil', exact: true }).click();
    const profilDialog = page.getByRole('dialog', { name: 'Profil Fakultas Tarbiyah' });
    await expect(profilDialog).toBeVisible();
    await expect(profilDialog).toContainText('Ilmu Pendidikan Islam Rahmatan Lil’alamin pada tahun 2035');
    await profilDialog.getByRole('button', { name: 'Close modal' }).click();
    await expect(profilDialog).toHaveCount(0);

    await expect(page.getByText('Become Future Educators with Global Impact')).toBeVisible();
    await expect(page.locator('#courses-section').getByText('Akademik', { exact: true })).toBeVisible();
    await expect(page.getByText('Program Studi Unggulan')).toBeVisible();
    await expect(page.getByText('Tarbiyah dalam Angka')).toBeVisible();
    await expect(page.getByText('Lembaga Akreditasi Mandiri Kependidikan')).toBeVisible();
    await expect(page.getByText('Mahasiswa Aktif', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Alumni')).toBeVisible();
    await expect(page.getByText('Doktor (S3)')).toBeVisible();
    await expect(page.getByText('Graduation Rate')).toBeVisible();
    await expect(page.getByText('47+')).toBeVisible();
    await expect(page.getByText('Alasan Kuliah')).toBeVisible();
    await expect(page.getByText('Kenapa Harus Kuliah di Fakultas Tarbiyah?')).toBeVisible();

    const servicesSection = page.locator('#layanan-section');
    await expect(servicesSection.getByText('Layanan Kami')).toBeVisible();
    await expect(servicesSection.getByRole('link', { name: /SIAKAD/ })).toHaveAttribute(
      'href',
      'https://iimsurakarta.siakadcloud.com/gate/login'
    );
    await expect(servicesSection.getByRole('button', { name: /Jurnal Tarbiyah/ })).toBeVisible();

    const newsSection = page.locator('#testimonials');
    await expect(newsSection.getByText('Berita Fakultas')).toBeVisible();
    await expect(newsSection.locator('article')).toHaveCount(6);
    await newsSection.getByRole('button', { name: '2', exact: true }).click();
    await expect(newsSection.locator('article')).toHaveCount(6);

    await expect(page.getByText('Berbagai macam pertanyaan yang sering ditanyakan antara lain')).toBeVisible();
    const firstFaqBtn = page.getByRole('button', { name: 'Nilai pada KHS tidak muncul, bagaimana solusinya?' });
    await firstFaqBtn.click();
    await expect(page.getByText('Pastikan anda sudah mengisi kuisioner evaluasi pembelajaran sebelum melihat KHS')).toBeVisible();

    const footerSection = page.locator('#footer-cta');
    await expect(footerSection.getByRole('link', { name: 'PMB Center' })).toHaveAttribute('href', 'https://wa.link/agu1p5');
    await expect(footerSection.getByRole('link', { name: 'Admin Fakultas' })).toHaveAttribute('href', 'https://wa.link/qrwv15');
    await expect(
      footerSection.locator('iframe[title="Peta Lokasi Kampus Fakultas Tarbiyah IIM Surakarta"]')
    ).toBeVisible();

    await expect(page.locator('#courses-section article')).toHaveCount(3);
    const pmbLinks = page.locator('#courses-section a', { hasText: 'Info PMB' });
    await expect(pmbLinks).toHaveCount(3);

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');

    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.getByTestId('lang-switch-en').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(mainNav.getByText('Faculty of Tarbiyah', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Welcome to the Faculty of Tarbiyah');
    await expect(page.getByText('Featured Study Programs')).toBeVisible();
    await expect(page.getByText('Faculty News')).toBeVisible();
    await expect(footerSection.getByText('Office Address')).toBeVisible();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByTestId('lang-switch-id').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');

    await page.getByTestId('search-toggle').click();
    const searchDialog = page.getByRole('dialog', { name: 'Pencarian Cepat Tarbiyah' });
    await expect(searchDialog).toBeVisible();
    const searchDialogBox = await searchDialog.boundingBox();
    expect(searchDialogBox.height).toBeGreaterThanOrEqual(500);
    const searchInputBox = await searchDialog.getByTestId('global-search-input').boundingBox();
    expect(searchInputBox.y).toBeGreaterThan(0);
    await expect(searchDialog.getByText('Program Studi Unggulan')).toHaveCount(0);
    await expect(searchDialog.getByText('Layanan Kampus')).toHaveCount(0);
    await expect(searchDialog.getByRole('button', { name: 'Program Studi' })).toHaveCount(0);
    await expect(searchDialog.getByRole('button', { name: 'Berita Fakultas' })).toHaveCount(0);
    await expect(searchDialog.getByRole('button', { name: 'FAQ' })).toHaveCount(0);
    await expect(searchDialog.getByTestId('search-catalog-submit')).toHaveCount(0);
    await searchDialog.getByTestId('global-search-input').fill('Tarbiyah');
    await expect(searchDialog.getByText('Berita Fakultas')).toBeVisible();
    await searchDialog.getByTestId('global-search-input').fill('zzznonexistentquery999');
    await expect(searchDialog.getByText('Tidak ada hasil yang cocok pada halaman beranda.')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(searchDialog).toHaveCount(0);

    await page.goto('/courses');
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/mentor');
    await expect(page).toHaveURL(/\/$/);

    await mainNav.getByTestId('navbar-logo').click();
    await mainNav.getByTestId('navbar-logo').click();
    await mainNav.getByTestId('navbar-logo').click();
    await expect(page).toHaveURL(/\/login/);

    expect(pageErrors).toEqual([]);
  });

  test('J2: Tarbiyah login UI, admin forgot-password restriction, and RBAC guard', async ({ page, createIsolatedStudent }) => {
    const nonAdmin = await createIsolatedStudent('E2E Portal NonAdmin');

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Tarbiyah Login' })).toHaveCSS('text-align', 'center');
    await expect(page.getByText('Selamat datang ke Tarbiyah Login')).toHaveCSS('text-align', 'center');
    await expect(page.getByPlaceholder('Masukan Email atau ID anda')).toBeVisible();
    await expect(page.getByPlaceholder('Masukkan Passcode anda')).toBeVisible();

    await page.getByLabel('Email / ID').fill('tarbiyah@iim.ac.id');
    await page.getByLabel('Passcode').fill('WrongPass!');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('alert')).toContainText('Email atau password salah');

    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
    await page.getByLabel('Email Pemulihan Admin').fill('bukanemailadmin@gmail.com');
    await page.getByRole('button', { name: 'Request Reset Token' }).click();
    await expect(page.getByRole('alert')).toContainText('Email pemulihan salah');

    await page.getByLabel('Email Pemulihan Admin').fill('iimtarbiyah20232@gmail.com');
    await page.getByRole('button', { name: 'Request Reset Token' }).click();
    await expect(page.getByRole('heading', { name: 'Set New Password' })).toBeVisible();

    await page.getByRole('link', { name: 'Back to Login' }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel('Email / ID').fill('tarbiyah@iim.ac.id');
    await page.getByLabel('Passcode').fill('adminganteng');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/admin/);

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/login');
    await page.getByLabel('Email / ID').fill(nonAdmin.email);
    await page.getByLabel('Passcode').fill(nonAdmin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/$/);
  });

  test('J3: Admin Control Center CMS updates Hero Title, switches i18n, and syncs to Home', async ({ page, loginViaApi }) => {
    await loginViaApi('admin@meekoo.test');
    await page.goto('/admin');

    await expect(page.getByRole('button', { name: 'CMS Halaman Utama' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pengguna & Peran' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Katalog & Persetujuan' })).toHaveCount(0);

    await page.getByTestId('lang-switch-en').click();
    await expect(page.getByRole('heading', { name: 'Faculty of Tarbiyah Portal Management' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Users & Roles' })).toBeVisible();
    await page.getByTestId('lang-switch-id').click();

    const titleInput = page.getByLabel('Judul Hero');
    await expect(titleInput).toHaveValue(/.+/);
    const originalTitle = await titleInput.inputValue();
    const updatedTitle = 'E2E Synced Hero Title 2026';

    await titleInput.fill(updatedTitle);
    await page.getByRole('button', { name: 'Simpan & Sinkronkan Landing' }).click();
    await expect(page.getByText('Pengaturan situs disimpan & halaman utama diperbarui!')).toBeVisible();

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(updatedTitle);

    await page.goto('/admin');
    const restoreInput = page.getByLabel('Judul Hero');
    await expect(restoreInput).toHaveValue(/.+/);
    await restoreInput.fill(originalTitle);
    await page.getByRole('button', { name: 'Simpan & Sinkronkan Landing' }).click();
    await expect(page.getByText('Pengaturan situs disimpan & halaman utama diperbarui!')).toBeVisible();
  });
});
