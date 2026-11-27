# Website Fakultas Tarbiyah

Portal resmi Fakultas Tarbiyah, Institut Islam Mambaul Ulum Surakarta.
Vue 3 + Vite (frontend), Express 5 (API), MySQL (data & media BLOB).

## Menjalankan

```bash
npm install
cp .env.example .env      # isi kredensial MySQL dan secret
npm run dev               # Vite dev server (port 5173, proxy /api ke 3001)
npm run dev:server        # API saja
npm run dev:all           # API + Vite sekaligus
```

## Build & produksi

```bash
npm run build             # hasil ke dist/
npm start                 # server Express menyajikan dist/ + /api/v1
```

`.env` wajib memuat `JWT_ACCESS_SECRET` (min. 32 karakter) dan, pada produksi,
`APPS_SCRIPT_RELAY_SECRET` (min. 16 karakter) — server menolak boot bila kosong.

## Basis data

Impor `server/database/u104886200_tarbiyah_iim.sql`. Setel
`max_allowed_packet` minimal 16 MB sebelum impor karena baris media terbesar
sekitar 2,3 MB.

## Pengujian

```bash
npm test                  # Vitest (wajib DB berakhiran _test)
npm run test:e2e          # Playwright (otomatis memakai DB _test & admin uji terisolasi)
npm run check:server      # node --check seluruh berkas JS
```

## Endpoint penting

| Endpoint | Keterangan |
| --- | --- |
| `GET /api/v1/health` | Status API + koneksi MySQL |
| `GET /api/v1/health/ready` | Kesiapan deploy (DB + relay) |
| `GET /sitemap.xml` | Sitemap dinamis dari host permintaan |
| `GET /api/v1/admin/audit-log` | Riwayat aksi tulis admin |

## Lisensi

Hak cipta Institut Islam Mambaul Ulum Surakarta. Penggunaan kode di luar
lingkungan institusi memerlukan izin tertulis.
