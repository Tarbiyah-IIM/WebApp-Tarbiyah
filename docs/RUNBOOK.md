# Runbook Operasional — Website Fakultas Tarbiyah

Rujukan singkat untuk operator server produksi (Hostinger).

## 1. Deploy

1. `git pull origin master`
2. `npm ci` (memakai `package-lock.json`, jangan `npm install` di produksi)
3. `npm run build`
4. Restart aplikasi Node/Passenger.

Server menolak boot bila `JWT_ACCESS_SECRET` < 32 karakter atau
`APPS_SCRIPT_RELAY_SECRET` < 16 karakter dengan `NODE_ENV=production`.

## 2. Migrasi basis data

Tabel `app_cache`, `access_token_revocations`, dan `admin_audit_log` wajib ada.
Jalankan potongan DDL dari `server/database/u104886200_tarbiyah_iim.sql` atau
impor ulang dump penuh dengan `max_allowed_packet` minimal 16 MB.

## 3. Rollback

1. `git checkout <commit-sebelumnya>`
2. `npm ci && npm run build`
3. Restart aplikasi.

Perubahan skema bersifat aditif (tabel baru), sehingga rollback kode tidak
memerlukan perubahan basis data.

## 4. Backup

- Harian: `mysqldump` seluruh basis data, simpan di luar web root.
- Sebelum migrasi: salin dump ke `.backups/` lokal (gitignored).
- Uji restore minimal sekali per kuartal ke basis data berakhiran `_test`.

## 5. Pemeriksaan kesehatan

| Endpoint | Arti |
| --- | --- |
| `GET /api/v1/health` | 200 bila MySQL terjangkau, 503 bila tidak |
| `GET /api/v1/health/ready` | 200 bila DB siap dan relay terkonfigurasi |

Pantau keduanya minimal tiap 5 menit.

## 6. Log

Server menulis JSON satu baris ke stdout/stderr, memuat `ts`, `level`, `msg`,
dan `requestId`. Setel `LOG_LEVEL=info` (atau `warn`) pada produksi.
Cari satu permintaan dengan `grep <requestId>`.

## 7. Audit trail

`GET /api/v1/admin/audit-log?limit=100` mengembalikan aksi tulis admin terakhir
(pengguna, aksi, entitas, waktu, IP). Tinjau berkala untuk perubahan tak wajar.

## 8. Batas operasional

- Jalankan **satu** proses Node, atau pindahkan cache ke penyimpanan bersama.
- `max_allowed_packet >= 16777216`.
- Port internal `3001` tidak boleh terbuka ke internet.
- `.env` dan `.backups/` harus berada di luar web root.
