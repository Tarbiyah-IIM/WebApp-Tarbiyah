import { expect, test } from './auth.fixture.js';

test('admin manages news categories; refuses deletion while category is assigned', async ({ page, loginViaApi, request }) => {
  const admin = await loginViaApi('tarbiyah@iim.ac.id');
  const headers = { Authorization: `Bearer ${admin.accessToken}` };
  const categoryNames = [];
  const newsIds = [];
  const agendaIds = [];

  try {
    const categoryList = await request.get('http://localhost:3001/api/v1/admin/news-categories', { headers });
    expect(categoryList.ok()).toBeTruthy();
    const { items: initialCategories } = await categoryList.json();
    expect(initialCategories.map((category) => category.name)).toEqual(expect.arrayContaining(['Akademik', 'Benchmarking', 'Akreditasi']));

    const createCategory = await request.post('http://localhost:3001/api/v1/admin/news-categories', {
      headers,
      data: { name: `E2E category ${Date.now()}` }
    });
    expect(createCategory.status()).toBe(201);
    const { category } = await createCategory.json();
    categoryNames.push(category.name);

    const newsCategoryList = await request.get('http://localhost:3001/api/v1/admin/news-categories', { headers });
    expect(newsCategoryList.ok()).toBeTruthy();
    expect((await newsCategoryList.json()).items.some((item) => item.id === category.id)).toBeTruthy();

    const createNews = await request.post('http://localhost:3001/api/v1/admin/testimonials', {
      headers,
      data: {
        name: `E2E news ${Date.now()}`,
        jobTitle: '21 November 2026',
        quote: 'Temporary category assignment for isolated category deletion coverage.',
        rating: 5,
        avatarUrl: null,
        categoryId: category.id,
        isVisible: true,
        sortOrder: 999
      }
    });
    expect(createNews.status()).toBe(201);
    const { testimonial } = await createNews.json();
    newsIds.push(testimonial.id);

    const deleteAssigned = await request.delete(`http://localhost:3001/api/v1/admin/news-categories/${category.id}`, { headers });
    expect(deleteAssigned.status()).toBe(409);

    const deleteNews = await request.delete(`http://localhost:3001/api/v1/admin/testimonials/${testimonial.id}`, { headers });
    expect(deleteNews.ok()).toBeTruthy();
    newsIds.splice(newsIds.indexOf(testimonial.id), 1);

    const deleteUnused = await request.delete(`http://localhost:3001/api/v1/admin/news-categories/${category.id}`, { headers });
    expect(deleteUnused.ok()).toBeTruthy();
    categoryNames.splice(categoryNames.indexOf(category.name), 1);

    await page.goto('/admin');
    await page.getByRole('button', { name: 'Berita', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Kategori Berita' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Hapus kategori.*Akademik/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Hapus kategori.*Benchmarking/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Hapus kategori.*Akreditasi/ })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Tambah Berita' })).toHaveCount(1);
    await page.getByRole('button', { name: 'Tambah Berita' }).click();
    await expect(page.getByRole('heading', { name: 'Tambah Data Berita & Info' })).toBeVisible();
    await expect(page.locator('#news-modal-category-trigger')).toBeVisible();
    await expect(page.locator('#news-modal-slideshow-pos')).toBeVisible();
    await expect(page.locator('#news-modal-slideshow-pos option[value="middle"]')).toHaveText('Tengah Berita');
    await expect(page.locator('#news-modal-summary')).toHaveCount(0);
    await expect(page.locator('#news-modal-full-content')).toBeVisible();
    await expect(page.locator('#news-modal-related-url')).toHaveCount(0);
    await page.getByRole('button', { name: 'Batal' }).click();

    const firstCatId = initialCategories[0].id;
    const secondCatId = initialCategories[1]?.id || firstCatId;
    const fullNewsRes = await request.post('http://localhost:3001/api/v1/admin/testimonials', {
      headers,
      data: {
        name: `E2E full article ${Date.now()}`,
        jobTitle: '23 November 2026',
        fullContent: 'Isi paragraf lengkap artikel uji coba.\n\nParagraf lanjutan untuk verifikasi pop-up.',
        galleryUrls: [],
        slideshowPosition: 'middle',
        categoryIds: firstCatId !== secondCatId ? [firstCatId, secondCatId] : [firstCatId],
        isVisible: true,
        sortOrder: 998
      }
    });
    expect(fullNewsRes.status()).toBe(201);
    const { testimonial: fullArticle } = await fullNewsRes.json();
    newsIds.push(fullArticle.id);

    await page.goto('/');
    await page.getByRole('button', { name: new RegExp(fullArticle.name) }).click();
    await expect(page).toHaveURL(/\/$/);
    const articleDialog = page.getByRole('dialog');
    await expect(articleDialog).toBeVisible();
    await expect(articleDialog.getByRole('button', { name: 'Close modal' })).toBeVisible();
    await expect(articleDialog.getByRole('heading', { name: fullArticle.name })).toBeVisible();
    await expect(articleDialog.getByText('Isi paragraf lengkap artikel uji coba.')).toBeVisible();
    await articleDialog.getByRole('button', { name: 'Close modal' }).click();
    await expect(articleDialog).toHaveCount(0);

    const createdBulkNames = [];
    for (let idx = 1; idx <= 6; idx += 1) {
      const bulkTitle = `E2E Page Item ${idx} ${Date.now()}`;
      createdBulkNames.push(bulkTitle);
      const bulkRes = await request.post('http://localhost:3001/api/v1/admin/testimonials', {
        headers,
        data: {
          name: bulkTitle,
          jobTitle: `${10 + idx} November 2026`,
          fullContent: `Konten uji pagination admin nomor ${idx}.`,
          categoryIds: [firstCatId],
          isVisible: true,
          sortOrder: 0
        }
      });
      expect(bulkRes.status()).toBe(201);
      newsIds.push((await bulkRes.json()).testimonial.id);
    }

    await page.goto('/admin');
    await page.getByRole('button', { name: 'Berita', exact: true }).click();
    await expect(page.locator('[data-testid="admin-news-grid"] article')).toHaveCount(6);
    await expect(page.getByRole('heading', { name: fullArticle.name })).toBeVisible();
    const adminNav = page.getByRole('navigation', { name: 'Navigasi Halaman Berita' });
    await expect(adminNav).toBeVisible();
    await adminNav.getByRole('button', { name: '2', exact: true }).click();
    await expect(page.locator('[data-testid="admin-news-grid"] article').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: createdBulkNames[0] })).toBeVisible();

    await page.getByRole('button', { name: 'Agenda', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Daftar Agenda' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tambah Agenda' })).toHaveCount(1);
    await page.getByRole('button', { name: 'Tambah Agenda' }).click();
    await expect(page.locator('#agenda-modal-location')).toHaveCount(0);
    await expect(page.locator('#agenda-modal-gallery')).toHaveCount(0);
    await expect(page.locator('#agenda-modal-slideshow-pos')).toHaveCount(0);
    await page.getByRole('button', { name: 'Batal' }).click();

    const agendaTitles = [];
    for (let idx = 1; idx <= 4; idx += 1) {
      const agendaTitle = `E2E Agenda ${idx} ${Date.now()}`;
      agendaTitles.push(agendaTitle);
      const aRes = await request.post('http://localhost:3001/api/v1/admin/agendas', {
        headers,
        data: {
          title: agendaTitle,
          eventDate: `${20 + idx} November 2026`,
          eventTime: '08.00 - 11.00 WIB',
          description: `Rincian kegiatan agenda E2E nomor ${idx}.`,
          isVisible: true
        }
      });
      expect(aRes.status()).toBe(201);
      agendaIds.push((await aRes.json()).agenda.id);
    }

    await page.goto('/');
    await expect(page.locator('[data-testid="landing-news-grid"] article')).toHaveCount(3);
    await expect(page.locator('[data-testid="landing-agenda-grid"] article')).toHaveCount(3);

    const newestAgendaTitle = agendaTitles[3];
    await page.getByRole('button', { name: new RegExp(newestAgendaTitle) }).click();
    const agendaDialog = page.getByRole('dialog');
    await expect(agendaDialog).toBeVisible();
    await expect(agendaDialog.getByRole('button', { name: 'Close modal' })).toBeVisible();
    await expect(agendaDialog.getByText('08.00 - 11.00 WIB')).toBeVisible();
    await agendaDialog.getByRole('button', { name: 'Close modal' }).click();
    await expect(agendaDialog).toHaveCount(0);
  } finally {
    for (const id of agendaIds) {
      await request.delete(`http://localhost:3001/api/v1/admin/agendas/${id}`, { headers });
    }
    for (const id of newsIds) {
      await request.delete(`http://localhost:3001/api/v1/admin/testimonials/${id}`, { headers });
    }
    for (const name of categoryNames) {
      const response = await request.get('http://localhost:3001/api/v1/admin/news-categories', { headers });
      const { items } = await response.json();
      const item = items.find((category) => category.name === name);
      if (item) await request.delete(`http://localhost:3001/api/v1/admin/news-categories/${item.id}`, { headers });
    }
  }
});
