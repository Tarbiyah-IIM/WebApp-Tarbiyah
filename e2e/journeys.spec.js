import { test, expect } from './auth.fixture.js';

test.describe('Meekoo Critical User Journeys', () => {
  test('J1: Landing page 11 sections, category filter, Load More, and catalog empty state', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    const mainNav = page.getByLabel('Main Navigation');
    await expect(mainNav.getByAltText('Logo Fakultas Tarbiyah')).toBeVisible();
    await expect(mainNav.getByText('Fakultas Tarbiyah', { exact: true })).toBeVisible();
    await expect(mainNav.getByText('Institut Islam Mambaul Ulum Surakarta', { exact: true })).toBeVisible();
    await expect(mainNav.getByRole('link', { name: 'Tentang Kami' })).toBeVisible();
    await expect(mainNav.getByRole('button', { name: 'Program Studi' })).toBeVisible();
    await expect(mainNav.getByRole('button', { name: 'Akademik' })).toBeVisible();
    await expect(mainNav.getByRole('button', { name: 'Publikasi' })).toBeVisible();
    await expect(mainNav.getByRole('button', { name: 'RPL' })).toBeVisible();
    await expect(mainNav.getByRole('link', { name: /Cart/i })).toHaveCount(0);

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
    await expect(page.getByText('Get Started')).toHaveCount(0);
    await expect(page.getByText('Browse Courses')).toHaveCount(0);

    await page.getByRole('button', { name: 'Profil', exact: true }).click();
    const profilDialog = page.getByRole('dialog', { name: 'Profil Fakultas Tarbiyah' });
    await expect(profilDialog).toBeVisible();
    await expect(profilDialog).toContainText('Ilmu Pendidikan Islam Rahmatan Lil’alamin pada tahun 2035');
    await expect(profilDialog).toContainText('Menyelenggarakan layanan pendidikan yang profesional dan berkualitas.');
    await profilDialog.getByRole('button', { name: 'Tutup' }).click();
    await expect(profilDialog).toHaveCount(0);

    await expect(page.getByText('Become Future Educators with Global Impact')).toBeVisible();
    await expect(page.getByText('#1 Online Course 2025')).toHaveCount(0);
    await expect(page.getByText('Best Collaboration')).toHaveCount(0);
    await expect(page.locator('#courses-section').getByText('Akademik', { exact: true })).toBeVisible();
    await expect(page.getByText('Program Studi Unggulan')).toBeVisible();
    await expect(page.getByText('Tarbiyah dalam Angka')).toBeVisible();
    await expect(page.getByText('Lembaga Akreditasi Mandiri Kependidikan')).toBeVisible();
    await expect(page.getByText('Mahasiswa Aktif', { exact: true })).toBeVisible();
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
    await expect(page.getByText('Pendidikan Agama Islam').first()).toBeVisible();
    await expect(page.getByText('Pendidikan Guru Madrasah Ibtidaiyah').first()).toBeVisible();
    await expect(page.getByText('Pendidikan Islam Anak Usia Dini').first()).toBeVisible();
    await expect(page.getByText('Weekly Skill Growth')).toHaveCount(0);
    await expect(page.getByText('Course Progress')).toHaveCount(0);
    await expect(page.getByText('Meet Our Expert Mentors')).toHaveCount(0);
    await expect(page.locator('#testimonials').getByText('Kegiatan Terbaru', { exact: true })).toBeVisible();
    await expect(page.locator('#testimonials').getByText('Berita Fakultas', { exact: true })).toBeVisible();
    await expect(page.getByText('Verified reviews from professionals and students leveling up their careers on Meekoo.')).toHaveCount(0);
    await expect(page.locator('#testimonials article')).toHaveCount(6);
    const newsNav = page.getByLabel('Navigasi Halaman Berita');
    await expect(newsNav.getByRole('button', { name: '1', exact: true })).toBeVisible();
    await expect(newsNav.getByRole('button', { name: '2', exact: true })).toBeVisible();
    await expect(newsNav.getByRole('button', { name: '3', exact: true })).toBeVisible();
    await expect(newsNav.getByRole('button', { name: /Next/i })).toBeVisible();
    await newsNav.getByRole('button', { name: '2', exact: true }).click();
    await expect(page.locator('#testimonials').getByText('Pelepasan Mahasiswa KKN Tematik Pemberdayaan Masyarakat Desa')).toBeVisible();
    await newsNav.getByRole('button', { name: /Next/i }).click();
    await expect(page.locator('#testimonials').getByText('Penandatanganan MoU Kemitraan Madrasah Ibtidaiyah se-Surakarta')).toBeVisible();
    await expect(page.locator('#faq').getByText('Berbagai macam pertanyaan yang sering ditanyakan antara lain')).toBeVisible();
    await expect(page.getByText('Clear answers on course access, requirements, enrollment, and refund guarantees.')).toHaveCount(0);
    await expect(page.locator('#faq').getByText('Nilai pada KHS tidak muncul, bagaimana solusinya?')).toBeVisible();
    await page.locator('#faq').getByRole('button', { name: 'Nilai pada KHS tidak muncul, bagaimana solusinya?' }).click();
    await expect(page.locator('#faq').getByText(/kuisioner evaluasi pembelajaran/i)).toBeVisible();
    await expect(page.locator('#faq').getByText('Ijazah atau Transkrip Nilai hilang/rusak, bagaimana solusinya?')).toBeVisible();

    const layananSection = page.locator('#layanan-section');
    await expect(layananSection.getByText('Layanan Kami', { exact: true })).toBeVisible();
    await expect(layananSection.locator('a, button')).toHaveCount(5);
    await expect(layananSection.getByRole('link', { name: /SIAKAD/i })).toHaveAttribute(
      'href',
      'https://iimsurakarta.siakadcloud.com/gate/login'
    );
    await expect(layananSection.getByRole('link', { name: /PDDIKTI/i })).toHaveAttribute(
      'href',
      'https://pddikti.kemdiktisaintek.go.id/detail-pt/QrBX3IX1gZ4iZ0vcL5jD04MAIVUIW1CYiBp9uu64SFTix7u8RRpcyBQOlHF0R3_Y1xWi4A=='
    );
    await expect(layananSection.getByRole('link', { name: /PMB/i })).toHaveAttribute(
      'href',
      'https://iimsurakarta.siakadcloud.com/spmbfront/home'
    );
    await expect(layananSection.getByRole('button', { name: /TRACER STUDY/i })).toBeVisible();
    await expect(layananSection.getByRole('button', { name: /Jurnal Tarbiyah/i })).toBeVisible();

    const footerSection = page.locator('#footer-cta');
    await expect(footerSection.getByText('Your Future Start Here!')).toBeVisible();
    await expect(
      footerSection.getByText(
        'Join more than 2,000 students who are developing the skills to become the educators and professionals of the future.'
      )
    ).toBeVisible();
    await expect(footerSection.locator('#footer-email')).toHaveCount(0);
    await expect(footerSection.getByRole('link', { name: /PMB Center/i })).toHaveAttribute(
      'href',
      'https://wa.link/agu1p5'
    );
    await expect(footerSection.getByRole('link', { name: /Admin Fakultas/i })).toHaveAttribute(
      'href',
      'https://wa.link/qrwv15'
    );

    await expect(page.locator('#courses-section article')).toHaveCount(3);
    await expect(page.locator('#courses-section [role="tab"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Load More Courses/i })).toHaveCount(0);

    const pmbLinks = page.locator('#courses-section a', { hasText: 'Info PMB' });
    await expect(pmbLinks).toHaveCount(3);
    await expect(pmbLinks.nth(0)).toHaveAttribute('href', 'https://iimsurakarta.siakadcloud.com/spmbfront/program-studi-detail/detail/86208');
    await expect(pmbLinks.nth(1)).toHaveAttribute('href', 'https://iimsurakarta.siakadcloud.com/spmbfront/program-studi-detail/detail/86232');
    await expect(pmbLinks.nth(2)).toHaveAttribute('href', 'https://iimsurakarta.siakadcloud.com/spmbfront/program-studi-detail/detail/86239');

    await page.goto('/courses');
    await page.getByLabel('Search courses').fill('zzznonexistentcourse999');
    await page.getByRole('button', { name: 'Filter' }).click();
    await expect(page.getByText('No matching courses found')).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('J2: Tarbiyah login UI, admin forgot-password restriction, and RBAC route guard', async ({ page, createIsolatedStudent }) => {
    const student = await createIsolatedStudent('E2E Auth Student');

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Tarbiyah Login' })).toHaveCSS('text-align', 'center');
    await expect(page.getByText('Selamat datang ke Tarbiyah Login')).toHaveCSS('text-align', 'center');
    await expect(page.getByPlaceholder('Masukan Email atau ID anda')).toBeVisible();
    await expect(page.getByPlaceholder('Masukkan Passcode anda')).toBeVisible();
    await expect(page.getByText('Sandbox Demo Accounts')).toHaveCount(0);
    await expect(page.getByText('Create an account')).toHaveCount(0);

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
    await page.getByLabel('Email / ID').fill(student.email);
    await page.getByLabel('Passcode').fill(student.password);
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
