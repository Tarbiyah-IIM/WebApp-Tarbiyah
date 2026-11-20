SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `certificates`;
DROP TABLE IF EXISTS `learning_path_items`;
DROP TABLE IF EXISTS `learning_paths`;
DROP TABLE IF EXISTS `community_posts`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `session_registrations`;
DROP TABLE IF EXISTS `live_sessions`;
DROP TABLE IF EXISTS `subscribers`;
DROP TABLE IF EXISTS `site_settings`;
DROP TABLE IF EXISTS `partners`;
DROP TABLE IF EXISTS `features`;
DROP TABLE IF EXISTS `stats`;
DROP TABLE IF EXISTS `faqs`;
DROP TABLE IF EXISTS `testimonials`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `lesson_progress`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `lessons`;
DROP TABLE IF EXISTS `sections`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `mentors`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'mentor', 'admin') NOT NULL DEFAULT 'student',
  `avatar_url` VARCHAR(500) NULL,
  `bio` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_resets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_password_resets_token` (`token_hash`),
  CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `refresh_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `revoked_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_refresh_tokens_hash` (`token_hash`),
  KEY `idx_refresh_tokens_user` (`user_id`),
  CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mentors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `name` VARCHAR(120) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `bio` TEXT NULL,
  `photo_url` VARCHAR(500) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mentors_user` (`user_id`),
  CONSTRAINT `fk_mentors_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `description` VARCHAR(255) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `courses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `mentor_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL,
  `subtitle` VARCHAR(255) NULL,
  `description` TEXT NOT NULL,
  `level` ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `thumbnail_url` VARCHAR(500) NULL,
  `badge` VARCHAR(60) NULL,
  `total_videos` INT UNSIGNED NOT NULL DEFAULT 0,
  `duration_hours` DECIMAL(5,1) NOT NULL DEFAULT 0.0,
  `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `rating_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `approval_status` ENUM('draft', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_courses_slug` (`slug`),
  KEY `idx_courses_cat_pub` (`category_id`, `is_published`),
  KEY `idx_courses_approval` (`approval_status`, `is_published`),
  CONSTRAINT `fk_courses_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_courses_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sections` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sections_course` (`course_id`),
  CONSTRAINT `fk_sections_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lessons` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `summary` TEXT NULL,
  `video_url` VARCHAR(500) NOT NULL,
  `duration_sec` INT UNSIGNED NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_preview` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lessons_section` (`section_id`),
  CONSTRAINT `fk_lessons_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `enrollments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `progress_pct` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `last_lesson_id` BIGINT UNSIGNED NULL,
  `enrolled_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_enrollment_user_course` (`user_id`, `course_id`),
  KEY `idx_enrollments_user` (`user_id`),
  CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollments_last_lesson` FOREIGN KEY (`last_lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lesson_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `lesson_id` BIGINT UNSIGNED NOT NULL,
  `completed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lesson_progress` (`user_id`, `lesson_id`),
  KEY `idx_lesson_progress_user_lesson` (`user_id`, `lesson_id`),
  CONSTRAINT `fk_lesson_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lesson_progress_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `order_code` VARCHAR(40) NOT NULL,
  `order_type` ENUM('course', 'subscription') NOT NULL DEFAULT 'course',
  `total` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `status` ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  `gateway_ref` VARCHAR(120) NULL,
  `payment_method` VARCHAR(60) NOT NULL DEFAULT 'sandbox_card',
  `paid_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_orders_code` (`order_code`),
  KEY `idx_orders_user_status` (`user_id`, `status`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `course_id` BIGINT UNSIGNED NULL,
  `item_title` VARCHAR(200) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reviews` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reviews_user_course` (`user_id`, `course_id`),
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `testimonials` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `job_title` VARCHAR(160) NOT NULL,
  `quote` TEXT NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `avatar_url` VARCHAR(500) NULL,
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faqs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` VARCHAR(255) NOT NULL,
  `answer` TEXT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `stats` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `stat_group` ENUM('hero', 'journey') NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `value_num` VARCHAR(40) NOT NULL,
  `suffix` VARCHAR(20) NOT NULL DEFAULT '',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `features` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(160) NOT NULL,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(60) NOT NULL DEFAULT 'check',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `partners` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `logo_url` VARCHAR(500) NULL,
  `url` VARCHAR(500) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `site_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_site_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `subscribers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `source` VARCHAR(60) NOT NULL DEFAULT 'footer',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_subscribers_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `live_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `mentor_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `starts_at` DATETIME NOT NULL,
  `duration_min` INT UNSIGNED NOT NULL DEFAULT 60,
  `platform` ENUM('zoom', 'google_meet') NOT NULL DEFAULT 'zoom',
  `meeting_url` VARCHAR(500) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_live_sessions_course` (`course_id`),
  CONSTRAINT `fk_live_sessions_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_live_sessions_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `session_registrations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_session_user` (`session_id`, `user_id`),
  CONSTRAINT `fk_session_reg_session` FOREIGN KEY (`session_id`) REFERENCES `live_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_session_reg_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `subscriptions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `plan` VARCHAR(60) NOT NULL DEFAULT 'premium_annual',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 160.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `status` ENUM('active', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
  `auto_renew` TINYINT(1) NOT NULL DEFAULT 1,
  `starts_at` DATETIME NOT NULL,
  `ends_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_subscriptions_user` (`user_id`),
  CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `community_posts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `parent_id` BIGINT UNSIGNED NULL,
  `body` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_community_course` (`course_id`),
  CONSTRAINT `fk_community_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_community_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_community_parent` FOREIGN KEY (`parent_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `learning_paths` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `goal_title` VARCHAR(160) NOT NULL,
  `interest_category_id` BIGINT UNSIGNED NULL,
  `target_level` ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_learning_paths_user` (`user_id`),
  CONSTRAINT `fk_learning_paths_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_learning_paths_category` FOREIGN KEY (`interest_category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `learning_path_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `path_id` BIGINT UNSIGNED NOT NULL,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lp_items_path` (`path_id`),
  CONSTRAINT `fk_lp_items_path` FOREIGN KEY (`path_id`) REFERENCES `learning_paths` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lp_items_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `certificates` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `certificate_code` VARCHAR(64) NOT NULL,
  `issued_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_certificates_code` (`certificate_code`),
  UNIQUE KEY `uq_cert_user_course` (`user_id`, `course_id`),
  CONSTRAINT `fk_certificates_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_certificates_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `avatar_url`, `bio`) VALUES
(1, 'Admin Fakultas Tarbiyah', 'tarbiyah@iim.ac.id', '$2b$10$mGhfnwa/kLVtgzsZ2I0fUOUt5B27XrWri4Dy1jx1yCgt1CV5BeQnO', 'admin', 'https://api.dicebear.com/9.x/initials/svg?seed=Admin+Tarbiyah', 'Administrator Fakultas Tarbiyah IIM Surakarta');











INSERT INTO `faqs` (`id`, `question`, `answer`, `sort_order`) VALUES
(1, 'Nilai pada KHS tidak muncul, bagaimana solusinya?', 'Pastikan anda sudah mengisi kuisioner evaluasi pembelajaran sebelum melihat KHS, jika sudah dipastikan telah mengisi, anda dapat langsung menghubungi dosen pengampu mata kuliah atau TU Fakultas masing-masing.', 1),
(2, 'Jika sudah memasuki Semester Akhir apakah harus melakukan KRS?', 'sangat di WAJIB kan karena jika tidak melakukan pengisian KRS nilai mata kuliah Tugas Akhir/Skripsi & Ujian Lisan/Komprehensif tidak muncul di SIAKAD dan tidak tercatat pada PDDikti sebagai Mahasiswa Aktif.', 2),
(3, 'Apakah bisa mengubah akun SIAKAD?', 'Bisa, silahkan menghubungi Tenaga Kependidikan Fakultas/Program Studi masing-masing untuk pengecekan.', 3),
(4, 'Biodata di laman PDDikti tidak sesuai, apakah bisa di perbaiki?', 'Bisa, bagi mahasiswa/i atau alumni yang terdapat kesalahan biodata pada PDDikti bisa di perbaiki dengan cara mengirimkankan bukti pendukung seperti file SCAN KTP, KK, Akta Kelahiran, KTM (bagi mahasiswa aktif), Ijazah dan Transkrip Nilai (Bagi Alumni), bukti di kirim ke Fakultas/Program Studi masing-masing. syarat dan ketentuan bisa dilihat pada laman Perbaikan Data Diri', 4),
(5, 'Ijazah atau Transkrip Nilai hilang/rusak, bagaimana solusinya?', 'Ijazah dan Transkrip Nilai hanya bisa dicetak satu kali, maka jika hilang/rusak kami hanya bisa mengeluarkan Surat Keterangan Pengganti Ijazah.', 5);

INSERT INTO `stats` (`id`, `stat_group`, `label`, `value_num`, `suffix`, `sort_order`) VALUES
(1, 'hero', 'Graduation Rate', '100', '%', 1),
(2, 'hero', 'Years of Experience', '47', '+', 2),
(3, 'hero', 'Academic System', '4', '', 3),
(4, 'hero', 'Academic Program', '3', '', 4),
(5, 'journey', 'Dosen', '59', '', 1),
(6, 'journey', 'Mahasiswa Aktif', '2.298', '', 2),
(7, 'journey', 'Doktor (S3)', '10', '', 3),
(8, 'journey', 'Total Alumni', '9.871', '', 4);

INSERT INTO `features` (`id`, `title`, `description`, `icon`, `sort_order`) VALUES
(1, 'Pendidikan Berbasis Nilai-Nilai Islam.', 'Mengembangkan kompetensi akademik dan profesional dengan landasan nilai-nilai rahmatan lil''alamin.', 'compass', 1),
(2, 'Pendidikan Agama Islam', 'Prodi ini menyelenggarakan pembelajaran yang profesional, responsif, dan berwawasan global hingga mampu menciptakan lulusan yang unggul.', 'video', 2),
(3, 'Pendidikan Guru Madrasah Ibtidaiyah', 'PGMI mampu menyiapkan sarjana yang mempunyai kemampuan akademis yang profesional dan berkarakter, memiliki kecakapan sosial dan manajerial, serta dapat mengembangkan pola kemitraan dengan berbagai pihak dalam rangka pengembangan Madrasah Ibtidaiyah.', 'layout-dashboard', 3),
(4, 'Pendidikan Islam Anak Usia Dini', 'Membangun Generasi Emas Sejak Usia Dini. PIAUD membekali mahasiswa dengan ilmu pendidikan, kreativitas, dan nilai-nilai keislaman untuk menjadi pendidik profesional, inovatif, dan inspiratif dalam membentuk karakter serta kecerdasan anak sejak usia dini.', 'users', 4);

INSERT INTO `partners` (`id`, `name`, `logo_url`, `url`, `sort_order`) VALUES
(1, 'SIAKAD | Sistem Informasi Akademik Mahasiswa', NULL, 'https://iimsurakarta.siakadcloud.com/gate/login', 1),
(2, 'PDDIKTI | Pangkalan Data Pendidikan Tinggi', NULL, 'https://pddikti.kemdiktisaintek.go.id/detail-pt/QrBX3IX1gZ4iZ0vcL5jD04MAIVUIW1CYiBp9uu64SFTix7u8RRpcyBQOlHF0R3_Y1xWi4A==', 2),
(3, 'PMB | Penerimaan Mahasiswa Baru', NULL, 'https://iimsurakarta.siakadcloud.com/spmbfront/home', 3),
(4, 'TRACER STUDY | Studi Pelacakan Jejak Alumni', NULL, NULL, 4),
(5, 'Jurnal Tarbiyah', NULL, '/publikasi/jurnal', 5);

INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES
('hero_title', 'Selamat Datang di Fakultas Tarbiyah'),
('hero_subtitle', 'Empowering the next generation of educators through academic excellence, innovative teaching, and strong Islamic values. We prepare future teachers and education leaders with the knowledge, skills, creativity, and global perspectives to inspire generations, transform education, and make a meaningful impact on society.'),
('hero_tagline', 'Become Future Educators with Global Impact'),
('premium_price', '160'),
('premium_currency', 'USD'),
('premium_label', 'Premium Access All Courses'),
('contact_phone', '+1 (415) 890-4321'),
('contact_address', '548 Market St, San Francisco, CA 94104'),
('footer_cta_title', 'Your Future Start Here!'),
('footer_cta_subtitle', 'Join more than 2K+ students who are developing the skills to become the educators and professionals of the future.'),
('social_twitter', 'https://x.com'),
('social_linkedin', 'https://linkedin.com'),
('social_instagram', 'https://instagram.com'),
('social_youtube', 'https://youtube.com');



