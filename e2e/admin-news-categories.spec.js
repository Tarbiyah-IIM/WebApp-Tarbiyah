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

    const highResPngBase64 = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 2400;
      canvas.height = 1800;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 2400, 1800);
      grad.addColorStop(0, '#0f3d2e');
      grad.addColorStop(0.5, '#1f6f54');
      grad.addColorStop(1, '#d97706');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 2400, 1800);
      for (let i = 0; i < 60; i += 1) {
        ctx.fillStyle = `rgba(${(i * 37) % 255}, ${(i * 73) % 255}, ${(i * 19) % 255}, 0.45)`;
        ctx.fillRect((i * 83) % 2200, (i * 59) % 1600, 240, 180);
      }
      return canvas.toDataURL('image/png').split(',')[1];
    });
    const highResBuffer = Buffer.from(highResPngBase64, 'base64');

    const newsUploadWait = page.waitForResponse(
      (res) => res.url().includes('/api/v1/admin/uploads') && res.request().method() === 'POST'
    );
    await page.locator('#news-modal-cover').setInputFiles({
      name: 'camera-highres-news.png',
      mimeType: 'image/png',
      buffer: highResBuffer
    });
    const newsUploadResp = await newsUploadWait;
    expect(newsUploadResp.status()).toBe(201);
    const newsUploadBody = await newsUploadResp.json();
    expect(newsUploadBody.filename).toMatch(/\.webp$/i);
    expect(newsUploadBody.sizeBytes).toBeLessThan(highResBuffer.length);
    const newsMediaMeta = await page.evaluate(async (mediaUrl) => {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = mediaUrl;
      });
      return { width: img.naturalWidth, height: img.naturalHeight };
    }, newsUploadBody.url);
    expect(Math.max(newsMediaMeta.width, newsMediaMeta.height)).toBeLessThanOrEqual(1600);
    await page.getByRole('button', { name: 'Batal' }).click();

    const firstCatId = initialCategories[0].id;
    const secondCatId = initialCategories[1]?.id || firstCatId;
    const fullNewsRes = await request.post('http://localhost:3001/api/v1/admin/testimonials', {
      headers,
      data: {
        name: `E2E full article ${Date.now()}`,
        jobTitle: '23 November 2026',
        fullContent: 'Isi paragraf lengkap artikel uji coba.\n\nParagraf lanjutan untuk verifikasi pop-up.',
        avatarUrl: newsUploadBody.url,
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
    await expect(page).toHaveURL(new RegExp(`\\?newsId=${fullArticle.id}$`));
    const articleDialog = page.getByRole('dialog');
    await expect(articleDialog).toBeVisible();
    await expect(articleDialog.getByRole('button', { name: 'Close modal' })).toBeVisible();
    await expect(articleDialog.getByRole('heading', { name: fullArticle.name })).toBeVisible();
    const articleParagraph = articleDialog.getByText('Isi paragraf lengkap artikel uji coba.');
    await expect(articleParagraph).toBeVisible();
    await expect(articleParagraph).toHaveCSS('text-align', 'justify');
    await expect(articleDialog.getByTestId('news-share-bar')).toBeVisible();
    await expect(articleDialog.getByTestId('news-copy-link-btn')).toHaveText(/Salin Link/);
    await expect(articleDialog.getByText(/^Tautan$/)).toHaveCount(0);
    await page.evaluate(() => {
      window.__openedShareUrls = [];
      window.open = (url) => {
        window.__openedShareUrls.push(String(url));
        return null;
      };
    });
    for (const [testId, expectedPattern] of [
      ['news-share-whatsapp', /^https:\/\/wa\.me\/\?text=/],
      ['news-share-telegram', /^https:\/\/t\.me\/share\/url/],
      ['news-share-facebook', /facebook\.com\/sharer/],
      ['news-share-x', /twitter\.com\/intent\/tweet/]
    ]) {
      await articleDialog.getByTestId('news-share-menu-btn').click();
      const newsSharePopover = articleDialog.getByTestId('news-share-popover');
      await expect(newsSharePopover).toBeVisible();
      const shareBtn = newsSharePopover.getByTestId(testId);
      await expect(shareBtn).toBeVisible();
      await shareBtn.click();
      await expect(newsSharePopover).toHaveCount(0);
      const opened = await page.evaluate(() => window.__openedShareUrls[window.__openedShareUrls.length - 1] || '');
      expect(opened).toMatch(expectedPattern);
    }
    await articleDialog.getByTestId('news-share-menu-btn').click();
    const newsSharePopover = articleDialog.getByTestId('news-share-popover');
    await expect(newsSharePopover).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(newsSharePopover).toHaveCount(0);
    await expect(articleDialog).toBeVisible();
    await articleDialog.getByRole('button', { name: 'Close modal' }).click();
    await expect(articleDialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);

    await page.goto(`/?newsId=${fullArticle.id}#testimonials`);
    const deepLinkedDialog = page.getByRole('dialog');
    await expect(deepLinkedDialog).toBeVisible();
    await expect(deepLinkedDialog.getByRole('heading', { name: fullArticle.name })).toBeVisible();
    await deepLinkedDialog.getByRole('button', { name: 'Close modal' }).click();
    await expect(deepLinkedDialog).toHaveCount(0);

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
    const agendaUploadWait = page.waitForResponse(
      (res) => res.url().includes('/api/v1/admin/uploads') && res.request().method() === 'POST'
    );
    await page.locator('#agenda-modal-cover').setInputFiles({
      name: 'camera-highres-agenda.png',
      mimeType: 'image/png',
      buffer: highResBuffer
    });
    const agendaUploadResp = await agendaUploadWait;
    expect(agendaUploadResp.status()).toBe(201);
    const agendaUploadBody = await agendaUploadResp.json();
    expect(agendaUploadBody.filename).toMatch(/\.webp$/i);
    expect(agendaUploadBody.sizeBytes).toBeLessThan(highResBuffer.length);
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
          coverUrl: idx === 1 ? agendaUploadBody.url : null,
          description: `Rincian kegiatan agenda E2E nomor ${idx}. Gabung via https://zoom.us/j/9988776655?pwd=test.`,
          isVisible: true
        }
      });
      expect(aRes.status()).toBe(201);
      agendaIds.push((await aRes.json()).agenda.id);
    }

    await page.goto('/');
    await expect(page.locator('[data-testid="landing-news-grid"] article')).toHaveCount(3);
    await expect(page.locator('[data-testid="landing-agenda-grid"] article')).toHaveCount(3);
    await expect(
      page.locator('[data-testid="landing-agenda-grid"]').getByText('Rincian kegiatan agenda E2E nomor 4')
    ).toHaveCount(0);

    const newestAgendaTitle = agendaTitles[3];
    await page.getByRole('button', { name: new RegExp(newestAgendaTitle) }).click();
    const agendaDialog = page.getByRole('dialog');
    await expect(agendaDialog).toBeVisible();
    const agendaPosterFrame = agendaDialog.getByTestId('agenda-poster-frame');
    await expect(agendaPosterFrame).toBeVisible();
    const agendaPosterImg = agendaPosterFrame.locator('img').last();
    await expect(agendaPosterImg).toHaveCSS('object-fit', 'contain');
    const agendaPosterBox = await agendaPosterImg.boundingBox();
    expect(agendaPosterBox.width).toBeLessThan(500);
    await expect(agendaDialog.getByRole('button', { name: 'Close modal' })).toBeVisible();
    await expect(agendaDialog.getByText('08.00 - 11.00 WIB')).toBeVisible();
    await expect(agendaDialog.getByText(/Rincian kegiatan agenda E2E nomor 4/)).toBeVisible();
    const agendaLink = agendaDialog.getByRole('link', { name: 'https://zoom.us/j/9988776655?pwd=test' });
    await expect(agendaLink).toBeVisible();
    await expect(agendaLink).toHaveAttribute('href', 'https://zoom.us/j/9988776655?pwd=test');
    await expect(agendaLink).toHaveAttribute('target', '_blank');
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
