-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Waktu pembuatan: 23 Nov 2026 pada 08.03
-- Versi server: 11.8.9-MariaDB-log
-- Versi PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u104886200_tarbiyah_iim`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `faqs`
--

CREATE TABLE `faqs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `faqs`
--

INSERT INTO `faqs` (`id`, `question`, `answer`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Nilai pada KHS tidak muncul, bagaimana solusinya?', 'Pastikan anda sudah mengisi kuisioner evaluasi pembelajaran sebelum melihat KHS, jika sudah dipastikan telah mengisi, anda dapat langsung menghubungi dosen pengampu mata kuliah atau TU Fakultas masing-masing.', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(2, 'Jika sudah memasuki Semester Akhir apakah harus melakukan KRS?', 'sangat di WAJIB kan karena jika tidak melakukan pengisian KRS nilai mata kuliah Tugas Akhir/Skripsi & Ujian Lisan/Komprehensif tidak muncul di SIAKAD dan tidak tercatat pada PDDikti sebagai Mahasiswa Aktif.', 2, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(3, 'Apakah bisa mengubah akun SIAKAD?', 'Bisa, silahkan menghubungi Tenaga Kependidikan Fakultas/Program Studi masing-masing untuk pengecekan.', 3, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(4, 'Biodata di laman PDDikti tidak sesuai, apakah bisa di perbaiki?', 'Bisa, bagi mahasiswa/i atau alumni yang terdapat kesalahan biodata pada PDDikti bisa di perbaiki dengan cara mengirimkankan bukti pendukung seperti file SCAN KTP, KK, Akta Kelahiran, KTM (bagi mahasiswa aktif), Ijazah dan Transkrip Nilai (Bagi Alumni), bukti di kirim ke Fakultas/Program Studi masing-masing. syarat dan ketentuan bisa dilihat pada laman Perbaikan Data Diri', 4, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(5, 'Ijazah atau Transkrip Nilai hilang/rusak, bagaimana solusinya?', 'Ijazah dan Transkrip Nilai hanya bisa dicetak satu kali, maka jika hilang/rusak kami hanya bisa mengeluarkan Surat Keterangan Pengganti Ijazah.', 5, '2026-11-20 10:13:21', '2026-11-20 10:13:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `features`
--

CREATE TABLE `features` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(160) NOT NULL,
  `description` text NOT NULL,
  `icon` varchar(60) NOT NULL DEFAULT 'check',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `features`
--

INSERT INTO `features` (`id`, `title`, `description`, `icon`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Pendidikan Berbasis Nilai-Nilai Islam.', 'Mengembangkan kompetensi akademik dan profesional dengan landasan nilai-nilai rahmatan lil\'alamin.', 'compass', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(2, 'Pendidikan Agama Islam', 'Prodi ini menyelenggarakan pembelajaran yang profesional, responsif, dan berwawasan global hingga mampu menciptakan lulusan yang unggul.', 'video', 2, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(3, 'Pendidikan Guru Madrasah Ibtidaiyah', 'PGMI mampu menyiapkan sarjana yang mempunyai kemampuan akademis yang profesional dan berkarakter, memiliki kecakapan sosial dan manajerial, serta dapat mengembangkan pola kemitraan dengan berbagai pihak dalam rangka pengembangan Madrasah Ibtidaiyah.', 'layout-dashboard', 3, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(4, 'Pendidikan Islam Anak Usia Dini', 'Membangun Generasi Emas Sejak Usia Dini. PIAUD membekali mahasiswa dengan ilmu pendidikan, kreativitas, dan nilai-nilai keislaman untuk menjadi pendidik profesional, inovatif, dan inspiratif dalam membentuk karakter serta kecerdasan anak sejak usia dini.', 'users', 4, '2026-11-20 10:13:21', '2026-11-20 10:13:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `media_files`
--

CREATE TABLE `media_files` (
  `id` char(36) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `mime_type` varchar(80) NOT NULL,
  `size_bytes` int(10) UNSIGNED NOT NULL,
  `data` mediumblob NOT NULL,
  `uploaded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `news_categories`
--

CREATE TABLE `news_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `news_categories`
--

INSERT INTO `news_categories` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Akademik', '2026-11-21 07:29:06', '2026-11-21 07:29:06'),
(2, 'Benchmarking', '2026-11-21 07:29:06', '2026-11-21 07:29:06'),
(3, 'Akreditasi', '2026-11-21 07:29:06', '2026-11-21 07:29:06');

-- --------------------------------------------------------

--
-- Struktur dari tabel `partners`
--

CREATE TABLE `partners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `partners`
--

INSERT INTO `partners` (`id`, `name`, `logo_url`, `url`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'SIAKAD | Sistem Informasi Akademik Mahasiswa', NULL, 'https://iimsurakarta.siakadcloud.com/gate/login', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(2, 'PDDIKTI | Pangkalan Data Pendidikan Tinggi', NULL, 'https://pddikti.kemdiktisaintek.go.id/detail-pt/QrBX3IX1gZ4iZ0vcL5jD04MAIVUIW1CYiBp9uu64SFTix7u8RRpcyBQOlHF0R3_Y1xWi4A==', 2, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(3, 'PMB | Penerimaan Mahasiswa Baru', NULL, 'https://iimsurakarta.siakadcloud.com/spmbfront/home', 3, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(4, 'TRACER STUDY | Studi Pelacakan Jejak Alumni', NULL, NULL, 4, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(5, 'Jurnal Tarbiyah', NULL, '/publikasi/jurnal', 5, '2026-11-20 10:13:21', '2026-11-20 10:13:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `password_resets`
--

CREATE TABLE `password_resets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES
(1, 5, '58fbca557c9d11e33d9d9980988b457fc5e707ea1887638b27440eb5dbb9c6e6', '2026-11-27 14:07:22', '2026-11-20 14:07:28', '2026-11-20 14:07:22', '2026-11-20 14:07:28'),
(2, 5, '28608a3d54bf06600a9e27fa2087420fb3e79cecbef4714324f5b958ffd3fa30', '2026-11-27 14:57:05', '2026-11-21 04:57:12', '2026-11-20 14:57:05', '2026-11-21 04:57:12'),
(3, 5, '3412f65643016201fd4e7fb121677f8de51f9817c51e61b4856e6dbe6e699d10', '2026-11-28 04:57:12', '2026-11-21 09:11:33', '2026-11-21 04:57:12', '2026-11-21 09:11:33'),
(4, 5, '489855e85f4aed475f12605df73667461b9f623bc9af6f3d474074265dd42bac', '2026-11-28 09:11:33', '2026-11-21 09:13:12', '2026-11-21 09:11:33', '2026-11-21 09:13:12'),
(5, 5, '339d11d6eee746c4809c0b1c0556e13feaaacdd59b94e85da7eba269b9191317', '2026-11-30 02:36:53', '2026-11-23 03:34:59', '2026-11-23 02:36:53', '2026-11-23 03:34:59'),
(6, 5, '451c4b2dfd010a3c80410db8b365f0121b75a4336f05e11836144b350205f613', '2026-11-30 03:34:59', '2026-11-23 04:05:23', '2026-11-23 03:34:59', '2026-11-23 04:05:23'),
(7, 5, 'dd44e3cd8d858eb119cf23c711196158cd3c88f9a90fae05ba6057e2c9b4acb6', '2026-11-30 04:05:23', NULL, '2026-11-23 04:05:23', '2026-11-23 04:05:23');

-- --------------------------------------------------------

--
-- Struktur dari tabel `site_settings`
--

CREATE TABLE `site_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `site_settings`
--

INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES
(1, 'hero_title', 'Selamat Datang di Fakultas Tarbiyah', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(2, 'hero_subtitle', 'Empowering the next generation of educators through academic excellence, innovative teaching, and strong Islamic values. We prepare future teachers and education leaders with the knowledge, skills, creativity, and global perspectives to inspire generations, transform education, and make a meaningful impact on society.', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(3, 'hero_tagline', 'Become Future Educators with Global Impact', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(4, 'premium_price', '160', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(5, 'premium_currency', 'USD', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(6, 'premium_label', 'Premium Access All Courses', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(7, 'contact_phone', '+1 (415) 890-4321', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(8, 'contact_address', '548 Market St, San Francisco, CA 94104', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(9, 'footer_cta_title', 'Your Future Start Here!', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(10, 'footer_cta_subtitle', 'Join more than 2K+ students who are developing the skills to become the educators and professionals of the future.', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(11, 'social_twitter', 'https://x.com', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(12, 'social_linkedin', 'https://linkedin.com', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(13, 'social_instagram', 'https://instagram.com', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(14, 'social_youtube', 'https://youtube.com', '2026-11-20 10:13:21', '2026-11-20 10:13:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `stats`
--

CREATE TABLE `stats` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `stat_group` enum('hero','journey') NOT NULL,
  `label` varchar(120) NOT NULL,
  `value_num` varchar(40) NOT NULL,
  `suffix` varchar(20) NOT NULL DEFAULT '',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `stats`
--

INSERT INTO `stats` (`id`, `stat_group`, `label`, `value_num`, `suffix`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'hero', 'Graduation Rate', '100', '%', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(2, 'hero', 'Years of Experience', '47', '+', 2, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(3, 'hero', 'Academic System', '4', '', 3, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(4, 'hero', 'Academic Program', '3', '', 4, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(5, 'journey', 'Dosen', '59', '', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(6, 'journey', 'Mahasiswa Aktif', '2.298', '', 2, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(7, 'journey', 'Doktor (S3)', '10', '', 3, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(8, 'journey', 'Total Alumni', '9.871', '', 4, '2026-11-20 10:13:21', '2026-11-20 10:13:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `subscribers`
--

CREATE TABLE `subscribers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(191) NOT NULL,
  `source` varchar(60) NOT NULL DEFAULT 'footer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `testimonials`
--

CREATE TABLE `testimonials` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `job_title` varchar(160) NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quote` text NOT NULL,
  `full_content` longtext DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL DEFAULT 5,
  `avatar_url` varchar(500) DEFAULT NULL,
  `gallery_urls` text DEFAULT NULL,
  `slideshow_position` enum('top','middle','bottom','none') NOT NULL DEFAULT 'bottom',
  `related_url` varchar(500) DEFAULT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `testimonial_categories`
--

CREATE TABLE `testimonial_categories` (
  `testimonial_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','mentor','admin') NOT NULL DEFAULT 'student',
  `avatar_url` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `avatar_url`, `bio`, `is_active`, `created_at`, `updated_at`) VALUES
(5, 'Admin Fakultas Tarbiyah', 'tarbiyah@iim.ac.id', '$2b$10$K6fR9sEtldyzTSctDWlvT.tj2y8o52Iz8KQVvBazyfHt5Ddx57QJq', 'admin', 'https://api.dicebear.com/9.x/initials/svg?seed=Admin+Tarbiyah', 'Administrator Fakultas Tarbiyah IIM Surakarta', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `features`
--
ALTER TABLE `features`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `media_files`
--
ALTER TABLE `media_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_media_files_uploaded_by` (`uploaded_by`);

--
-- Indeks untuk tabel `news_categories`
--
ALTER TABLE `news_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_news_categories_name` (`name`);

--
-- Indeks untuk tabel `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_password_resets_token` (`token_hash`),
  ADD KEY `fk_password_resets_user` (`user_id`);

--
-- Indeks untuk tabel `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_refresh_tokens_hash` (`token_hash`),
  ADD KEY `idx_refresh_tokens_user` (`user_id`);

--
-- Indeks untuk tabel `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_site_settings_key` (`setting_key`);

--
-- Indeks untuk tabel `stats`
--
ALTER TABLE `stats`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `subscribers`
--
ALTER TABLE `subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_subscribers_email` (`email`);

--
-- Indeks untuk tabel `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_testimonials_category` (`category_id`);

--
-- Indeks untuk tabel `testimonial_categories`
--
ALTER TABLE `testimonial_categories`
  ADD PRIMARY KEY (`testimonial_id`,`category_id`),
  ADD KEY `idx_tc_category` (`category_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `features`
--
ALTER TABLE `features`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `news_categories`
--
ALTER TABLE `news_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `partners`
--
ALTER TABLE `partners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `site_settings`
--
ALTER TABLE `site_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `stats`
--
ALTER TABLE `stats`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `subscribers`
--
ALTER TABLE `subscribers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `testimonials`
--
ALTER TABLE `testimonials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `media_files`
--
ALTER TABLE `media_files`
  ADD CONSTRAINT `fk_media_files_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `testimonials`
--
ALTER TABLE `testimonials`
  ADD CONSTRAINT `fk_testimonials_news_category` FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`id`);

--
-- Ketidakleluasaan untuk tabel `testimonial_categories`
--
ALTER TABLE `testimonial_categories`
  ADD CONSTRAINT `fk_tc_category` FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tc_testimonial` FOREIGN KEY (`testimonial_id`) REFERENCES `testimonials` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
