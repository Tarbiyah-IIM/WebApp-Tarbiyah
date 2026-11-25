import { expect, test } from '@playwright/test';

const defaultScriptUrl =
  'https://script.google.com/macros/s/AKfycbwjx4f_R-H4MXwGpjMyI8X-BpGKASOTfkuwqMWp1JkjcvPRYyhiI9C00gMQTp351LHo/exec';

const sampleNativePayload = {
  ok: true,
  needsAppsScriptDeploy: false,
  scriptUrl: defaultScriptUrl,
  syncedAt: '2026-11-25T01:00:00.000Z',
  data: {
    prodiList: ['PAI', 'PIAUD', 'PGMI'],
    dosenList: ['Dr. H. Muhammad Ja\'far Nashir, S.Ag., M.Ag', 'Lailla Hidayatul Amin, M.Pd.I.'],
    incompleteLectures: [
      {
        rowIndex: 52,
        prodi: 'PAI',
        dosenPengampu: 'Lailla Hidayatul Amin, M.Pd.I.',
        dosenTamu: 'Prof. Dr. Ahmad Fauzi',
        mataKuliah: 'Metodologi Pembelajaran PAI',
        tema: '',
        tanggal: '',
        jam: '',
        peserta: '100',
        fotoNarsum: '',
        status: 'Not Started',
        needsTema: true,
        needsTanggal: true,
        needsJam: true,
        needsFoto: true
      }
    ],
    trackingLectures: [
      {
        rowIndex: 51,
        prodi: 'PGMI',
        dosenPengampu: 'Dr. H. Muhammad Ja\'far Nashir, S.Ag., M.Ag',
        dosenTamu: 'Dr. Amik Nadziroh, M.Pd (Universitas Islam Tribakti Lirboyo Kediri)',
        mataKuliah: 'Strategi Belajar Mengajar',
        tema: 'Prinsip-prinsip dalam pemilihan strategi pembelajaran',
        tanggal: '03/12/2026',
        jam: '14.30 - 16.00 WIB',
        peserta: '300',
        linkZoom: 'Topik: Strategi Belajar Mengajar\nJoin Zoom Meeting: https://zoom.us/j/123456789?pwd=abc',
        permohonanUndanganList: [{ label: 'Undangan Resmi.pdf', url: 'https://drive.google.com/file/d/inv1/view' }],
        flayerList: [{ label: 'Flayer.png', url: 'https://drive.google.com/file/d/fly1/view' }],
        sertifikatList: [
          { label: 'Sertifikat 1', url: 'https://drive.google.com/file/d/cert1/view' },
          { label: 'Sertifikat 2', url: 'https://drive.google.com/file/d/cert2/view' }
        ],
        status: 'Done'
      },
      {
        rowIndex: 50,
        prodi: 'PIAUD',
        dosenPengampu: 'Lailla Hidayatul Amin, M.Pd.I.',
        dosenTamu: 'Dr. Himmah Taulany, S.Pd., M.Pd',
        mataKuliah: 'Penyusunan Kurikulum AUD',
        tema: 'Kurikulum Merdeka untuk PAUD',
        tanggal: '05/12/2026',
        jam: '10.00 - 11.30 WIB',
        peserta: 'Offline',
        linkZoom: '',
        permohonanUndanganList: [],
        flayerList: [],
        sertifikatList: [],
        status: 'Process'
      }
    ]
  }
};

test('guest lecture page renders native UI with filters, Zoom copy modal, drawer, and new registration modal', async ({
  page
}) => {
  const postedPayloads = [];

  await page.route('**/api/v1/guest-lectures**', async (route) => {
    const req = route.request();
    if (req.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sampleNativePayload)
      });
    }
    if (req.method() === 'POST') {
      const body = req.postDataJSON();
      postedPayloads.push(body);
      return route.fulfill({
        status: body.mode === 'update' ? 200 : 201,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          isComplete: true,
          status: 'Process',
          message: 'Agenda kuliah tamu berhasil disimpan.',
          rowIndex: body.rowIndex || 53
        })
      });
    }
    return route.continue();
  });

  await page.goto('/kuliah-tamu');

  await expect(page.getByRole('navigation', { name: 'Main Navigation' })).toBeVisible();
  const region = page.getByRole('region', { name: 'Kuliah Tamu', exact: true });
  await expect(region.getByRole('heading', { name: 'Formulir Agenda Kuliah Tamu' })).toBeVisible();
  await expect(region.locator('iframe')).toHaveCount(0);

  await expect(page.locator('[data-testid="guest-lecture-tracking-list"] article')).toHaveCount(2);
  await expect(region.getByRole('link', { name: 'Sertifikat P1' })).toBeVisible();
  await expect(region.getByRole('link', { name: 'Sertifikat P2' })).toBeVisible();
  await expect(region.getByText('Tatap Muka (Tanpa Zoom)')).toBeVisible();

  await region.getByRole('button', { name: /^PGMI/ }).click();
  await expect(page.locator('[data-testid="guest-lecture-tracking-list"] article')).toHaveCount(1);
  await expect(region.getByText('Strategi Belajar Mengajar')).toBeVisible();

  await region.getByRole('button', { name: 'Zoom Meeting' }).click();
  const zoomDialog = page.getByRole('dialog');
  await expect(zoomDialog).toBeVisible();
  await expect(zoomDialog.getByRole('link', { name: 'https://zoom.us/j/123456789?pwd=abc' })).toBeVisible();
  await zoomDialog.getByRole('button', { name: 'Batal' }).click();
  await expect(zoomDialog).toHaveCount(0);

  await region.getByRole('tab', { name: /Data Belum Lengkap/ }).click();
  await expect(page.locator('[data-testid="guest-lecture-incomplete-list"] article')).toHaveCount(1);
  await region.getByRole('button', { name: 'Lengkapi Agenda' }).click();

  const drawer = page.getByRole('dialog', { name: 'Lengkapi Agenda Perkuliahan' });
  await expect(drawer).toBeVisible();
  await drawer.locator('#gl-edit-topic').fill('Inovasi Pembelajaran PAI Berbasis Digital');
  await drawer.locator('#gl-edit-date').fill('2026-12-10');
  await drawer.locator('#gl-edit-time').fill('09.00 - 11.00 WIB');
  await drawer.getByRole('button', { name: 'Simpan Isian (Set Process)' }).click();
  await expect(drawer).toHaveCount(0);
  expect(postedPayloads[0]).toMatchObject({
    mode: 'update',
    rowIndex: 52,
    tanggal: '10/12/2026',
    jam: '09.00 - 11.00 WIB'
  });

  await region.getByRole('button', { name: 'Tambah Kuliah Tamu' }).click();
  const newModal = page.getByRole('dialog');
  await expect(newModal).toBeVisible();
  await newModal.locator('#gl-new-prodi').selectOption('PAI');
  await newModal.locator('#gl-new-course').fill('Filsafat Pendidikan Islam');
  await newModal.locator('#gl-new-speaker').fill('Dr. Narasumber Uji');
  await newModal.getByRole('button', { name: 'Simpan Agenda' }).click();
  await expect(newModal).toHaveCount(0);
  expect(postedPayloads[1]).toMatchObject({
    mode: 'new',
    prodi: 'PAI',
    mataKuliah: 'Filsafat Pendidikan Islam'
  });
});

test('guest lecture page gracefully falls back when Apps Script JSON is not deployed and when offline', async ({
  page
}) => {
  await page.route('**/api/v1/guest-lectures**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: false,
        needsAppsScriptDeploy: true,
        fallbackUrl: defaultScriptUrl,
        data: null
      })
    })
  );
  await page.route(defaultScriptUrl, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `<!doctype html><html><body style="margin:0"><div style="height:1850px">Apps Script compatibility iframe</div><script>window.parent.postMessage({type:'TARBIYAH_GUEST_LECTURE_HEIGHT',height:1850},'*');</script></body></html>`
    })
  );

  await page.goto('/kuliah-tamu');
  const region = page.getByRole('region', { name: 'Kuliah Tamu', exact: true });
  const iframe = region.locator('iframe[title="Formulir Kuliah Tamu Fakultas Tarbiyah"]');
  await expect(iframe).toBeVisible();
  await expect(iframe.contentFrame().locator('body')).toContainText('Apps Script compatibility iframe');
  await expect(region.getByRole('link', { name: 'Buka formulir Kuliah Tamu' })).toHaveCount(0);
  await expect(region.getByText(/Deploy versi terbaru Code\.js/)).toHaveCount(0);
  await expect(iframe).toHaveAttribute('scrolling', 'no');
  await expect.poll(async () => (await iframe.boundingBox())?.height || 0).toBeGreaterThanOrEqual(1800);

  await page.context().setOffline(true);
  const alert = region.getByRole('alert');
  await expect(alert).toContainText('Perangkat sedang offline');
  await expect(alert.getByRole('link', { name: 'Buka formulir Kuliah Tamu' })).toHaveCount(0);
  await expect(alert.getByRole('button', { name: 'Coba Lagi' })).toBeVisible();
  await page.context().setOffline(false);
});
