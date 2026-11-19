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
    await expect(mainNav.getByRole('link', { name: 'Pendidikan Agama Islam' })).toHaveAttribute('href', '/program-studi/pai');
    await expect(mainNav.getByRole('link', { name: 'Pendidikan Guru Madrasah Ibtidaiyah' })).toHaveAttribute('href', '/program-studi/pgmi');
    await expect(mainNav.getByRole('link', { name: 'Pendidikan Islam Anak Usia Dini' })).toHaveAttribute('href', '/program-studi/piaud');

    await mainNav.getByRole('button', { name: 'Akademik' }).click();
    await expect(mainNav.getByRole('link', { name: 'Surat Aktif Mahasiswa' })).toHaveAttribute(
      'href',
      'https://baau.iim.ac.id/index.php/layanan/surat-aktif-kuliah/'
    );
    await expect(mainNav.getByRole('link', { name: 'Administrasi Persuratan' })).toHaveAttribute(
      'href',
      '/akademik/administrasi-persuratan'
    );
    await expect(mainNav.getByRole('link', { name: 'Ujian Komprehensif' })).toHaveAttribute(
      'href',
      '/akademik/ujian-komprehensif'
    );
    await expect(mainNav.getByRole('link', { name: 'Munaqasyah' })).toHaveAttribute(
      'href',
      'https://www.myskripsi.iimsurakarta.ac.id/myskripsi/dashboard/'
    );

    await mainNav.getByRole('button', { name: 'Publikasi' }).click();
    await expect(mainNav.getByRole('link', { name: 'Praktek Pengalaman Lapangan (PPL)' })).toHaveAttribute('href', '/publikasi/ppl');
    await expect(mainNav.getByRole('link', { name: 'Praktek Kerja Nyata (PKN)' })).toHaveAttribute('href', '/publikasi/pkn');
    await expect(mainNav.getByRole('link', { name: 'Jurnal' })).toHaveAttribute('href', '/publikasi/jurnal');
    await expect(mainNav.getByRole('button', { name: 'Penelitian dan Pengabdian' })).toBeVisible();

    await mainNav.getByRole('button', { name: 'RPL' }).click();
    await expect(mainNav.getByRole('link', { name: 'Pedoman RPL' })).toHaveAttribute(
      'href',
      'https://drive.google.com/drive/folders/1knidvsDcia_CmXB4wfi81Xrr9RPImn7l?usp=sharing'
    );
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
    await expect(page.getByText('Dosen', { exact: true })).toBeVisible();
    await expect(page.getByText('Learners', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Mahasiswa Aktif', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Alumni')).toBeVisible();
    await expect(page.getByText('Doktor (S3)')).toBeVisible();
    await expect(page.getByText('Graduation Rate')).toBeVisible();
    await expect(page.getByText('Academic System', { exact: true })).toBeVisible();
    await expect(page.getByText('academic system', { exact: true })).toHaveCount(0);
    await expect(page.getByText('47+')).toBeVisible();
    await expect(page.getByText('Alasan Kuliah')).toBeVisible();
    await expect(page.getByText('Kenapa Harus Kuliah di Fakultas Tarbiyah?')).toBeVisible();

    const servicesSection = page.locator('#layanan-section');
    await expect(servicesSection.getByText('Layanan Kami')).toBeVisible();
    await expect(servicesSection.getByRole('link', { name: /SIAKAD/ })).toHaveAttribute(
      'href',
      'https://iimsurakarta.siakadcloud.com/gate/login'
    );
    await expect(servicesSection.getByRole('link', { name: /Jurnal Tarbiyah/ })).toHaveAttribute('href', '/publikasi/jurnal');

    const newsSection = page.locator('#testimonials');
    await expect(newsSection.getByRole('heading', { name: 'Berita Fakultas' })).toBeVisible();
    await expect(newsSection.locator('article')).toHaveCount(0);
    await expect(newsSection.getByText('Belum ada berita fakultas yang dipublikasikan.')).toBeVisible();

    await expect(page.getByText('Berbagai macam pertanyaan yang sering ditanyakan antara lain')).toBeVisible();
    const firstFaqBtn = page.getByRole('button', { name: 'Nilai pada KHS tidak muncul, bagaimana solusinya?' });
    await firstFaqBtn.click();
    await expect(page.getByText('Pastikan anda sudah mengisi kuisioner evaluasi pembelajaran sebelum melihat KHS')).toBeVisible();

    const footerSection = page.locator('#footer-cta');
    await expect(
      footerSection.getByText(
        'Join more than 2K+ students who are developing the skills to become the educators and professionals of the future.'
      )
    ).toBeVisible();
    await expect(footerSection.getByText('2,000 students')).toHaveCount(0);
    await expect(footerSection.getByRole('link', { name: 'PMB Center' })).toHaveAttribute('href', 'https://wa.link/agu1p5');
    await expect(footerSection.getByRole('link', { name: 'Admin Fakultas' })).toHaveAttribute('href', 'https://wa.link/qrwv15');
    await expect(footerSection.getByRole('link', { name: /PAI \(Al'ulum/ })).toHaveAttribute(
      'href',
      'https://jurnal.iimsurakarta.ac.id/index.php/alulum'
    );
    await expect(footerSection.getByRole('link', { name: /PGMI \(Journal of Research/ })).toHaveAttribute(
      'href',
      'https://jurnal.iimsurakarta.ac.id/index.php/rimie'
    );
    await expect(footerSection.getByRole('link', { name: /PIAUD \(Education Journal/ })).toHaveAttribute(
      'href',
      'https://jurnal.iimsurakarta.ac.id/index.php/emerald'
    );
    await expect(
      footerSection.locator('iframe[title="Peta Lokasi Kampus Fakultas Tarbiyah IIM Surakarta"]')
    ).toBeVisible();

    await expect(page.locator('#courses-section article')).toHaveCount(3);
    await expect(page.locator('#courses-section img')).toHaveCount(0);
    await expect(page.locator('#courses-section h3', { hasText: /^Pendidikan Agama Islam$/ })).toBeVisible();
    await expect(page.locator('#courses-section h3', { hasText: 'Program Studi Pendidikan Agama Islam' })).toHaveCount(0);
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
    await expect(page.getByRole('heading', { name: 'Faculty News' })).toBeVisible();
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
    await searchDialog.getByTestId('global-search-input').fill('KHS');
    await expect(searchDialog.getByText('FAQ')).toBeVisible();
    await searchDialog.getByTestId('global-search-input').fill('zzznonexistentquery999');
    await expect(searchDialog.getByText('Tidak ada hasil yang cocok pada halaman beranda.')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(searchDialog).toHaveCount(0);

    await page.goto('/program-studi/pai');
    await expect(page.getByRole('heading', { level: 1, name: 'Pendidikan Agama Islam' })).toBeVisible();
    await expect(page.locator('main section img')).toHaveCount(0);
    await expect(page.locator('main a', { hasText: 'Info PMB' })).toHaveAttribute(
      'href',
      'https://iimsurakarta.siakadcloud.com/spmbfront/program-studi-detail/detail/86208'
    );
    await expect(page.locator('main aside').getByText('Pusat Layanan Tarbiyah')).toBeVisible();
    await expect(page.locator('main aside').getByText('Email Resmi')).toHaveCount(0);
    await expect(page.locator('main aside').getByText(/meekoo/i)).toHaveCount(0);
    await expect(page.locator('main aside').getByRole('link', { name: 'Hubungi Admin Fakultas' })).toBeVisible();
    await expect(page.locator('main aside').getByRole('link', { name: 'Konsultasi PMB Center' })).toBeVisible();
    await page.goto('/program-studi/pgmi');
    await expect(page.getByRole('heading', { level: 1, name: 'Pendidikan Guru Madrasah Ibtidaiyah' })).toBeVisible();
    await page.goto('/program-studi/piaud');
    await expect(page.getByRole('heading', { level: 1, name: 'Pendidikan Islam Anak Usia Dini' })).toBeVisible();
    await page.goto('/program-studi/unknown-slug');
    await expect(page.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeVisible();

    await page.goto('/akademik/administrasi-persuratan');
    await expect(page.getByRole('heading', { level: 1, name: 'Administrasi Persuratan' })).toBeVisible();
    await expect(page.getByText('PASTIKAN DATA YANG ANDA ISI SUDAH BENAR, CEK KEMBALI DATA YANG ANDA ISI SEBELUM TERBUBUHI STEMPEL DAN TANDA TANGAN')).toBeVisible();
    await expect(page.locator('main a', { hasText: 'Unduh Surat Permohonan' })).toHaveAttribute(
      'href',
      'https://drive.google.com/drive/folders/1D7KqdUPHy4nH5W1gxo2PWJyFImmKLwLI?usp=sharing'
    );
    await expect(page.locator('main a', { hasText: 'Ambil Nomor Surat' })).toHaveAttribute(
      'href',
      'https://drive.google.com/open?authuser=0&id=1MayDKlAWQH0-i58i-1CenBr2Zg00ofyFB3DiBLL_95s'
    );
    await expect(page.locator('main aside')).toHaveCount(0);
    await expect(page.getByText('Surat Izin Observasi & Penelitian')).toBeVisible();
    await expect(page.getByText('Surat Keterangan Aktif Kuliah')).toHaveCount(0);
    await expect(page.getByText('Pastikan Nomor Surat sesuai dengan yang terbaru')).toBeVisible();
    await expect(page.getByText('Staf Pengajaran memverifikasi kelengkapan data dan format keaslian Surat Permohonan.')).toBeVisible();
    await expect(
      page.getByText(
        'Dokumen surat resmi diterbitkan dalam bentuk cetak berstempel dan sudah di Tanda Tangani oleh Dosen Mata Kuliah & Wakil Dekan I.'
      )
    ).toBeVisible();
    await page.goto('/akademik/ujian-komprehensif');
    await expect(page.getByRole('heading', { level: 1, name: 'Ujian Komprehensif' })).toBeVisible();
    await expect(page.locator('main a', { hasText: 'Registrasi' }).first()).toHaveAttribute(
      'href',
      'https://forms.gle/ZZWzX2kp2QbEdC9C8'
    );
    await expect(page.locator('main aside').getByText('Pusat Layanan Tarbiyah')).toHaveCount(0);
    await expect(page.locator('main aside').getByText('Kembali ke Beranda')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Dokumen Terkait Ujian Lisan' })).toBeVisible();
    await expect(page.locator('main aside').getByText('Jurnal Fakultas Tarbiyah')).toHaveCount(0);

    await page.getByRole('button', { name: /Surat Keterangan Lulus/ }).click();
    const sklDialog = page.getByRole('dialog', { name: 'Surat Keterangan Lulus' });
    await expect(sklDialog).toBeVisible();
    await expect(sklDialog.getByRole('button', { name: 'Tutup' })).toHaveCount(0);
    await expect(sklDialog.locator('iframe')).toHaveAttribute(
      'src',
      'https://drive.google.com/embeddedfolderview?id=13_dF8zydSGEh-21eJK16OgkKpDvwcW36#list'
    );
    await page.keyboard.press('Escape');
    await expect(sklDialog).toHaveCount(0);

    await page.getByRole('button', { name: /Panduan Akses laman MySkripsi/ }).click();
    const mySkripsiDialog = page.getByRole('dialog', { name: 'Panduan Akses laman MySkripsi' });
    await expect(mySkripsiDialog).toBeVisible();
    await expect(mySkripsiDialog.locator('iframe')).toHaveAttribute(
      'src',
      'https://drive.google.com/file/d/1wwc73lS43GiK-CFxXNS9PFANYLyOlK3A/preview'
    );
    await page.keyboard.press('Escape');
    await expect(mySkripsiDialog).toHaveCount(0);

    await page.getByRole('button', { name: /Matriks\/Panduan\/Kisi-Kisi Ujian Komprehensif/ }).click();
    const matriksDialog = page.getByRole('dialog', { name: 'Matriks/Panduan/Kisi-Kisi Ujian Komprehensif' });
    await expect(matriksDialog).toBeVisible();
    await expect(matriksDialog.locator('iframe')).toHaveAttribute(
      'src',
      'https://drive.google.com/file/d/1YnuiT6SpPbanfejjqEwZITB6bwY0evCu/preview'
    );
    await page.keyboard.press('Escape');
    await expect(matriksDialog).toHaveCount(0);

    await page.getByTestId('lang-switch-en').click();
    await expect(page.getByRole('heading', { level: 1, name: 'Comprehensive Examination' })).toBeVisible();
    await page.getByTestId('lang-switch-id').click();
    await page.goto('/publikasi/ppl');
    await expect(page.getByRole('heading', { level: 1, name: 'Praktek Pengalaman Lapangan (PPL)' })).toBeVisible();
    await expect(page.getByText('Pendaftaran (Akses Awal)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Closed' })).toBeVisible();
    await expect(page.getByText('Pusat Layanan Tarbiyah')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Administrasi' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Surat Ijin Kerja/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Surat Ijin PPL/ })).toBeVisible();
    await page.getByRole('button', { name: /Surat Ijin Kerja/ }).click();
    const kerjaDialog = page.getByRole('dialog', { name: 'Formulir Pengajuan Surat Ijin Kerja (PPL)' });
    await expect(kerjaDialog).toBeVisible();
    await expect(kerjaDialog.locator('iframe')).toHaveCount(0);
    await expect(kerjaDialog.getByLabel(/Kepada \(Yth\.\)/)).toBeVisible();
    await expect(kerjaDialog.getByLabel(/Nama Lengkap Mahasiswa/)).toBeVisible();
    await expect(kerjaDialog.getByLabel(/NIM/)).toBeVisible();
    await expect(kerjaDialog.getByLabel(/Program Studi/)).toBeVisible();
    await expect(kerjaDialog.getByLabel(/Semester/)).toBeVisible();
    await expect(kerjaDialog.getByLabel(/Instansi \/ Tempat PPL/)).toBeVisible();
    await expect(kerjaDialog.getByLabel(/Alamat Lengkap Instansi PPL/)).toBeVisible();
    await kerjaDialog.getByRole('button', { name: 'Buat & Unduh Surat' }).click();
    await expect(kerjaDialog.getByText(/Kepada \(Yth\.\) wajib diisi\./)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(kerjaDialog).toHaveCount(0);

    await page.getByRole('button', { name: /Surat Ijin PPL/ }).click();
    const pplPermitDialog = page.getByRole('dialog', { name: 'Surat Ijin PPL' });
    await expect(pplPermitDialog).toBeVisible();
    await expect(pplPermitDialog.getByText('Coming Soon', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(pplPermitDialog).toHaveCount(0);
    await expect(page.locator('main aside').getByText('Jurnal Fakultas Tarbiyah')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Unduh Dokumen Pelengkap Laporan (Form) PPL' })).toBeVisible();
    await expect(page.locator('main a', { hasText: 'Form Observasi Sekolah' })).toHaveAttribute(
      'href',
      'https://drive.google.com/uc?export=download&id=1xeq4m-ocSmBaqsYDXPQG0X00BtHUJvSa'
    );
    await expect(page.locator('main a', { hasText: 'Form Jurnal Harian Mahasiswa' })).toHaveAttribute(
      'href',
      'https://drive.google.com/uc?export=download&id=1oxm5Et4KTyXe6wUkskF-MRS2meVDWfRa'
    );
    await expect(page.locator('main a', { hasText: 'Form Observasi Kelas Guru Mengajar' })).toHaveAttribute(
      'href',
      'https://drive.google.com/uc?export=download&id=1FThthx6Unb6mH1_gHyhY9mhIGR_juuit'
    );
    await expect(page.locator('main a', { hasText: 'Form Penilaian Latihan Mengajar N3' })).toHaveAttribute(
      'href',
      'https://drive.google.com/uc?export=download&id=1n0Ju1xzW_Qr6HUEtIrcCGjwchVYJM9cu'
    );
    await expect(page.locator('main a', { hasText: 'Form Penilaian Ujian Praktek Mengajar N4' })).toHaveAttribute(
      'href',
      'https://drive.google.com/uc?export=download&id=1dY6O_gtnFmDsFdXWzjkWgatTuDtyJBiV'
    );
    await expect(page.locator('main a', { hasText: 'Form Laporan PPL' })).toHaveAttribute(
      'href',
      'https://drive.google.com/uc?export=download&id=1g-z4PkwEtoNm_yJ3OUoxQmv7RZSBMsrW'
    );
    await expect(page.locator('main a', { hasText: 'Form Bimbingan DPL' })).toHaveAttribute(
      'href',
      'https://drive.google.com/uc?export=download&id=1jDeI8ABs3nj1At35BpUQqjrARkjX08HG'
    );
    await page.goto('/publikasi/pkn');
    await expect(page.getByRole('heading', { level: 1, name: 'Praktek Kerja Nyata (PKN)' })).toBeVisible();
    await page.getByTestId('lang-switch-en').click();
    await expect(page.getByRole('heading', { level: 1, name: 'Community Fieldwork (PKN)' })).toBeVisible();
    await page.getByTestId('lang-switch-id').click();
    await page.goto('/publikasi/jurnal');
    await expect(page.getByRole('heading', { level: 1, name: 'Jurnal Fakultas Tarbiyah' })).toBeVisible();
    await expect(page.locator('main aside')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Jurnal Terbitan & Fokus Kajian' })).toBeVisible();
    const journalCards = page.locator('main section', { hasText: 'Jurnal Terbitan & Fokus Kajian' });
    await expect(journalCards.locator('a', { hasText: 'Al’ulum Jurnal Pendidikan Islam' })).toHaveAttribute(
      'href',
      'https://jurnal.iimsurakarta.ac.id/index.php/alulum'
    );
    await expect(journalCards.getByText('Jurnal Pendidikan Agama Islam (PAI)')).toBeVisible();
    await expect(
      journalCards.locator('a', { hasText: 'Journal of Research and Innovation in Madrasah Ibtidaiyah Education' })
    ).toHaveAttribute('href', 'https://jurnal.iimsurakarta.ac.id/index.php/rimie');
    await expect(journalCards.getByText('Jurnal Pendidikan Guru MI (PGMI)')).toBeVisible();
    await expect(
      journalCards.locator('a', { hasText: "Education Journal of Mamba'ul 'Ulum for Early Childhood Development" })
    ).toHaveAttribute('href', 'https://jurnal.iimsurakarta.ac.id/index.php/emerald');
    await expect(journalCards.getByText('Jurnal Pendidikan Islam Anak Usia Dini (PIAUD)')).toBeVisible();
    await expect(journalCards.locator('a', { hasText: 'Jurnal Institut' })).toHaveAttribute(
      'href',
      'https://jurnal.iimsurakarta.ac.id/index.php/mu'
    );
    await expect(journalCards.locator('a', { hasText: 'Jurnal Institut' })).toContainText("Mamba'ul 'Ulum");

    await page.goto('/courses');
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/mentor');
    await expect(page).toHaveURL(/\/$/);

    await page.setViewportSize({ width: 390, height: 844 });
    const bottomNav = page.getByTestId('mobile-bottom-nav');
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByTestId('bottom-nav-home')).toBeVisible();
    const prodiBtn = bottomNav.getByTestId('bottom-nav-prodi');
    const searchFab = bottomNav.getByTestId('mobile-bottom-search');
    const academicBtn = bottomNav.getByTestId('bottom-nav-akademik');
    const moreBtn = bottomNav.getByTestId('bottom-nav-more');
    await expect(prodiBtn).toBeVisible();
    await expect(searchFab).toBeVisible();
    await expect(academicBtn).toBeVisible();
    await expect(moreBtn).toBeVisible();

    const [prodiBox, searchBox, academicBox] = await Promise.all([
      prodiBtn.boundingBox(),
      searchFab.boundingBox(),
      academicBtn.boundingBox()
    ]);
    expect(prodiBox.x).toBeLessThan(searchBox.x);
    expect(searchBox.x).toBeLessThan(academicBox.x);

    await prodiBtn.click();
    const mobileSheet = page.getByTestId('mobile-bottom-sheet');
    await expect(mobileSheet).toBeVisible();
    await expect(mobileSheet.getByRole('link', { name: 'Pendidikan Agama Islam' })).toHaveAttribute('href', '/program-studi/pai');

    await academicBtn.click();
    await expect(mobileSheet.getByRole('link', { name: 'Ujian Komprehensif' })).toHaveAttribute('href', '/akademik/ujian-komprehensif');

    await moreBtn.click();
    await expect(mobileSheet.getByText('Publikasi', { exact: true })).toBeVisible();
    await expect(mobileSheet.getByText('RPL', { exact: true })).toBeVisible();
    await expect(mobileSheet.getByRole('link', { name: 'Jurnal' })).toHaveAttribute('href', '/publikasi/jurnal');
    await expect(mobileSheet.getByRole('link', { name: 'Pedoman RPL' })).toHaveAttribute(
      'href',
      'https://drive.google.com/drive/folders/1knidvsDcia_CmXB4wfi81Xrr9RPImn7l?usp=sharing'
    );
    await page.keyboard.press('Escape');
    await expect(mobileSheet).toHaveCount(0);

    await searchFab.click();
    const mobileSearchDialog = page.getByRole('dialog', { name: 'Pencarian Cepat Tarbiyah' });
    await expect(mobileSearchDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(mobileSearchDialog).toHaveCount(0);

    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(bottomNav).toBeHidden();

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
    await expect(page.getByText('Email Kontak')).toHaveCount(0);

    const landingRes = await page.request.get('/api/v1/landing');
    expect(landingRes.ok()).toBeTruthy();
    const landingPayload = await landingRes.json();
    expect(landingPayload.settings.contact_email).toBeUndefined();

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
