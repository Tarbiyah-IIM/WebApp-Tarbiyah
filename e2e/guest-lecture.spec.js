import { expect, test } from '@playwright/test';

const formUrl = 'https://script.google.com/macros/s/AKfycbwjx4f_R-H4MXwGpjMyI8X-BpGKASOTfkuwqMWp1JkjcvPRYyhiI9C00gMQTp351LHo/exec';

async function stubAppScript(page) {
  await page.route(formUrl, (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><html><body>Embedded form placeholder</body></html>'
  }));
}

test('guest lecture page embeds AppScript and provides direct link', async ({ page }) => {
  await stubAppScript(page);
  await page.goto('/kuliah-tamu');

  await expect(page.getByRole('heading', { name: 'Kuliah Tamu' })).toBeVisible();
  const iframe = page.locator('iframe[title="Formulir Kuliah Tamu Fakultas Tarbiyah"]');
  await expect(iframe).toHaveAttribute('src', formUrl);
  await expect(page.frameLocator('iframe[title="Formulir Kuliah Tamu Fakultas Tarbiyah"]').locator('body'))
    .toContainText('Embedded form placeholder');
  await expect(page.getByRole('link', { name: 'Buka formulir Kuliah Tamu' })).toHaveAttribute('href', formUrl);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(iframe).toBeVisible();
  expect((await iframe.boundingBox()).width).toBeGreaterThan(350);
});

test('guest lecture page shows offline fallback without hiding direct link', async ({ page }) => {
  await stubAppScript(page);
  await page.goto('/kuliah-tamu');
  await expect(page.locator('iframe')).toHaveAttribute('src', formUrl);

  await page.context().setOffline(true);
  await expect(page.getByRole('alert')).toContainText('Formulir tidak dapat dimuat');
  await expect(page.getByRole('link', { name: 'Buka formulir Kuliah Tamu' })).toHaveAttribute('href', formUrl);

  await page.context().setOffline(false);
  await expect(page.getByRole('alert')).toHaveCount(0);
});
