import { expect, test } from './auth.fixture.js';

test('admin manages news categories; refuses deletion while category is assigned', async ({ page, loginViaApi, request }) => {
  const admin = await loginViaApi('tarbiyah@iim.ac.id');
  const headers = { Authorization: `Bearer ${admin.accessToken}` };
  const categoryNames = [];
  const newsIds = [];

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
  } finally {
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
