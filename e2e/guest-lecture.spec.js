import { expect, test } from '@playwright/test';

const formUrl = 'https://script.google.com/macros/s/AKfycbwjx4f_R-H4MXwGpjMyI8X-BpGKASOTfkuwqMWp1JkjcvPRYyhiI9C00gMQTp351LHo/exec';

async function stubAppScript(page) {
  await page.route(formUrl, (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><html><body>Embedded form placeholder</body></html>'
  }));
}

test('guest lecture page embeds AppScript without an opening card', async ({ page }) => {
  await stubAppScript(page);
  await page.goto('/kuliah-tamu');

  await expect(page.getByRole('navigation', { name: 'Main Navigation' })).toBeVisible();
  const guestLecture = page.getByRole('region', { name: 'Kuliah Tamu', exact: true });
  const iframe = guestLecture.locator('iframe[title="Formulir Kuliah Tamu Fakultas Tarbiyah"]');
  await expect(iframe).toHaveAttribute('src', formUrl);
  await expect(iframe.contentFrame().locator('body')).toContainText('Embedded form placeholder');
  await expect(guestLecture.getByRole('heading')).toHaveCount(0);
  await expect(guestLecture.getByRole('link', { name: 'Buka formulir Kuliah Tamu' })).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(iframe).toBeVisible();
  expect((await iframe.boundingBox()).width).toBeGreaterThan(350);
});

test('guest lecture page offers a direct link while offline', async ({ page }) => {
  await stubAppScript(page);
  await page.goto('/kuliah-tamu');

  const guestLecture = page.getByRole('region', { name: 'Kuliah Tamu', exact: true });
  const alert = guestLecture.getByRole('alert');
  const directLink = guestLecture.getByRole('link', { name: 'Buka formulir Kuliah Tamu' });
  await expect(guestLecture.locator('iframe').contentFrame().locator('body')).toContainText('Embedded form placeholder');
  await expect(guestLecture.getByRole('status')).toHaveCount(0);

  await page.context().setOffline(true);
  await expect(alert).toContainText('Formulir tidak dapat dimuat');
  await expect(directLink).toBeVisible();
  await expect(directLink).toHaveAttribute('href', formUrl);

  await page.context().setOffline(false);
  await expect(alert).toHaveCount(0);
  await expect(directLink).toHaveCount(0);
});
