CREATE DATABASE IF NOT EXISTS `meekoo_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `meekoo_db`;

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
(1, 'Admin Meekoo', 'admin@meekoo.test', '$2b$10$OgY5P2N/5mGb53EBaNWYMO9qp.Ik/RYb1WQ84SIbtliHAEtr7aO9y', 'admin', 'https://api.dicebear.com/9.x/initials/svg?seed=Admin+Meekoo', 'Operations & Platform Administrator'),
(2, 'Sarah Johnson', 'sarah@meekoo.test', '$2b$10$OgY5P2N/5mGb53EBaNWYMO9qp.Ik/RYb1WQ84SIbtliHAEtr7aO9y', 'mentor', 'https://api.dicebear.com/9.x/initials/svg?seed=Sarah+Johnson', 'AI Expert & Data Scientist with 10+ years of applied ML leadership.'),
(3, 'Marcus Vance', 'marcus@meekoo.test', '$2b$10$OgY5P2N/5mGb53EBaNWYMO9qp.Ik/RYb1WQ84SIbtliHAEtr7aO9y', 'mentor', 'https://api.dicebear.com/9.x/initials/svg?seed=Marcus+Vance', 'Cybersecurity Specialist & Cloud Architecture Mentor.'),
(4, 'Nadia Putri', 'student@meekoo.test', '$2b$10$OgY5P2N/5mGb53EBaNWYMO9qp.Ik/RYb1WQ84SIbtliHAEtr7aO9y', 'student', 'https://api.dicebear.com/9.x/initials/svg?seed=Nadia+Putri', 'Product Designer transitioning into Fullstack & AI Product Engineering.'),
(5, 'Admin Fakultas Tarbiyah', 'tarbiyah@iim.ac.id', '$2b$10$K6fR9sEtldyzTSctDWlvT.tj2y8o52Iz8KQVvBazyfHt5Ddx57QJq', 'admin', 'https://api.dicebear.com/9.x/initials/svg?seed=Admin+Tarbiyah', 'Administrator Fakultas Tarbiyah IIM Surakarta');

INSERT INTO `mentors` (`id`, `user_id`, `name`, `title`, `bio`, `photo_url`, `sort_order`, `is_active`) VALUES
(1, 2, 'Sarah Johnson', 'AI Expert & Data Scientist', 'Former Principal Data Scientist leading enterprise NLP and predictive analytics platforms.', 'https://api.dicebear.com/9.x/avataaars/svg?seed=SarahJohnson', 1, 1),
(2, 3, 'Marcus Vance', 'Cybersecurity Specialist', 'Security architect specializing in zero-trust web infrastructure and DevSecOps.', 'https://api.dicebear.com/9.x/avataaars/svg?seed=MarcusVance', 2, 1),
(3, NULL, 'Elena Rostova', 'Lead Product Designer', 'Design systems director crafting accessible SaaS interfaces for global teams.', 'https://api.dicebear.com/9.x/avataaars/svg?seed=ElenaRostova', 3, 1),
(4, NULL, 'Daniel Kim', 'Principal Fullstack Engineer', 'Built high-throughput Node.js and Vue platforms serving millions of learners.', 'https://api.dicebear.com/9.x/avataaars/svg?seed=DanielKim', 4, 1),
(5, NULL, 'Maya Lin', 'Growth Marketing Director', 'Scaled B2B and consumer SaaS funnels across North America and Southeast Asia.', 'https://api.dicebear.com/9.x/avataaars/svg?seed=MayaLin', 5, 1),
(6, NULL, 'David Thorne', 'Corporate Finance Strategist', 'Financial modeling advisor helping founders and analysts master valuation.', 'https://api.dicebear.com/9.x/avataaars/svg?seed=DavidThorne', 6, 1);

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `sort_order`) VALUES
(1, 'UI/UX Design', 'ui-ux-design', 'Product design, Figma systems, user research, and interactive prototyping.', 1),
(2, 'Web Development', 'web-development', 'Modern frontend, backend APIs, databases, and production deployment.', 2),
(3, 'Marketing & Communication', 'marketing-communication', 'Brand storytelling, PR strategy, and executive communication.', 3),
(4, 'Digital Marketing', 'digital-marketing', 'Performance ads, SEO, lifecycle retention, and analytics.', 4),
(5, 'Business Consulting', 'business-consulting', 'Operations strategy, management frameworks, and client advisory.', 5),
(6, 'Finance Management', 'finance-management', 'Corporate finance, financial modeling, budgeting, and risk analysis.', 6);

INSERT INTO `courses` (`id`, `category_id`, `mentor_id`, `title`, `slug`, `subtitle`, `description`, `level`, `price`, `currency`, `thumbnail_url`, `badge`, `total_videos`, `duration_hours`, `rating_avg`, `rating_count`, `approval_status`, `is_published`) VALUES
(1, 1, 3, 'Complete Product Design & Design Systems', 'complete-product-design-systems', 'Build scalable Figma component libraries and ship production-ready UI.', 'Master end-to-end UI/UX workflows from user discovery and wireframing to tokenized design systems and developer handoff.', 'beginner', 69.00, 'USD', 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=900&q=80', 'Best Seller', 4, 14.5, 4.90, 1, 'approved', 1),
(2, 2, 4, 'Fullstack Vue 3, Node.js & MySQL Mastery', 'fullstack-vue-nodejs-mysql', 'Architect fast, secure web apps with REST APIs and relational schemas.', 'Learn modern Composition API, Pinia state management, Express REST APIs, JWT authentication, and parameterized MySQL queries.', 'intermediate', 89.00, 'USD', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80', 'Top Ranked', 4, 22.0, 4.85, 1, 'approved', 1),
(3, 3, 5, 'Strategic Brand Communication & Storytelling', 'strategic-brand-communication', 'Craft high-impact narratives that convert audiences and align teams.', 'Practical frameworks for executive presentations, brand positioning, crisis communication, and multi-channel messaging.', 'beginner', 49.00, 'USD', 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80', 'Popular', 2, 9.5, 4.75, 0, 'approved', 1),
(4, 4, 5, 'Performance Digital Marketing & Growth Analytics', 'performance-digital-marketing', 'Scale acquisition profitably with attribution, SEO, and lifecycle funnels.', 'Build measurable campaigns across search, social, and email automation backed by cohort analysis and conversion experiments.', 'intermediate', 59.00, 'USD', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80', 'Best Seller', 2, 12.0, 4.80, 0, 'approved', 1),
(5, 5, 1, 'AI-Driven Business Consulting & Strategy', 'ai-driven-business-consulting', 'Solve complex enterprise problems with structured frameworks and AI.', 'Combine classic consulting problem trees with modern data modeling to deliver actionable growth roadmaps.', 'advanced', 99.00, 'USD', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80', 'Top Ranked', 2, 16.0, 4.95, 0, 'approved', 1),
(6, 6, 6, 'Corporate Finance Modeling & Valuation', 'corporate-finance-modeling', 'Build three-statement models, DCF valuations, and board-ready dashboards.', 'Hands-on spreadsheet and scenario modeling techniques used by investment analysts and CFO teams.', 'intermediate', 79.00, 'USD', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80', 'New Release', 2, 15.0, 4.70, 0, 'approved', 1),
(7, 1, 3, 'UX Research & Usability Testing Lab', 'ux-research-usability-testing', 'Turn qualitative interviews into measurable product improvements.', 'Design interview scripts, run moderated usability sessions, synthesize insights, and prioritize roadmap bets.', 'beginner', 54.00, 'USD', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=900&q=80', 'Popular', 2, 10.0, 4.80, 0, 'approved', 1),
(8, 2, 2, 'Web Security & Resilient Cloud APIs', 'web-security-resilient-apis', 'Harden Node.js backends against OWASP Top 10 and scale reliably.', 'Implement rate limiting, token rotation, SQL injection defense, webhook HMAC verification, and automated security checks.', 'advanced', 94.00, 'USD', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80', 'Top Ranked', 2, 18.0, 4.92, 0, 'approved', 1),
(9, 3, 5, 'Executive Leadership & Stakeholder Alignment', 'executive-leadership-alignment', 'Lead cross-functional initiatives with clarity and influence.', 'Develop persuasive communication habits, conflict resolution playbooks, and clear strategic briefs.', 'intermediate', 45.00, 'USD', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80', NULL, 2, 8.5, 4.65, 0, 'approved', 1),
(10, 4, 5, 'Technical SEO & Content Engine Architecture', 'technical-seo-content-engine', 'Capture compounding organic traffic with structured topic clusters.', 'Audit crawlability, Core Web Vitals, schema markup, and editorial workflows built for sustainable growth.', 'beginner', 52.00, 'USD', 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=900&q=80', 'Popular', 2, 11.0, 4.78, 0, 'approved', 1),
(11, 5, 6, 'SaaS Unit Economics & Operations Playbook', 'saas-unit-economics-operations', 'Optimize LTV, CAC, churn, and operational cadence for growing teams.', 'Practical benchmarks and operating cadences for founders, COOs, and business consultants.', 'intermediate', 84.00, 'USD', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80', 'Best Seller', 2, 13.5, 4.88, 0, 'approved', 1),
(12, 6, 6, 'Treasury, Cash Flow & Risk Management', 'treasury-cashflow-risk-management', 'Protect working capital and forecast liquidity under uncertainty.', 'Build rolling 13-week cash forecasts, FX hedging basics, and capital allocation scorecards.', 'advanced', 74.00, 'USD', 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=900&q=80', NULL, 2, 12.5, 4.72, 0, 'approved', 1);

INSERT INTO `sections` (`id`, `course_id`, `title`, `sort_order`) VALUES
(1, 1, 'Foundations of Design Systems', 1),
(2, 1, 'Component Architecture & Handoff', 2),
(3, 2, 'Relational Data & Express API Core', 1),
(4, 2, 'Vue 3 Pinia State & Production Security', 2),
(5, 3, 'Narrative Frameworks', 1),
(6, 4, 'Acquisition & Funnel Attribution', 1),
(7, 5, 'Structured Problem Solving with AI', 1),
(8, 6, 'Three-Statement Financial Modeling', 1),
(9, 7, 'Discovery & Usability Protocols', 1),
(10, 8, 'API Hardening & Zero-Trust Auth', 1),
(11, 9, 'Influence Without Authority', 1),
(12, 10, 'Crawl Architecture & Core Web Vitals', 1),
(13, 11, 'SaaS Metrics & Operating Cadence', 1),
(14, 12, 'Liquidity Forecasting & Risk Controls', 1);

INSERT INTO `lessons` (`id`, `section_id`, `title`, `summary`, `video_url`, `duration_sec`, `sort_order`, `is_preview`) VALUES
(1, 1, 'Why Design Tokens Matter at Scale', 'Understand semantic naming for colors, spacing, and typography.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 420, 1, 1),
(2, 1, 'Auditing Existing UI Patterns', 'Inventory components and eliminate visual drift across teams.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 540, 2, 0),
(3, 2, 'Building Accessible Variants in Figma', 'Interactive states, focus rings, and WCAG contrast verification.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 600, 1, 0),
(4, 2, 'Developer Handoff & Documentation', 'Sync tokens with Tailwind CSS config cleanly.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 480, 2, 0),
(5, 3, 'Designing Normalized MySQL 8 Schemas', 'Indexes, foreign keys, and transactional integrity.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 630, 1, 1),
(6, 3, 'Parameterized Queries & Zod Validation', 'Prevent SQL injection and validate payloads cleanly.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 580, 2, 0),
(7, 4, 'Pinia Stores & Token Refresh Interceptors', 'Keep auth state synchronized across tabs and dashboards.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 660, 1, 0),
(8, 4, 'Deployment & Error Observability', 'Build verification, health checks, and clean logs.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 510, 2, 0),
(9, 5, 'Positioning Your Core Brand Promise', 'Define clarity before scaling campaigns.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 450, 1, 1),
(10, 5, 'Executive Storytelling Structure', 'Persuasive decks that win stakeholder buy-in.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 520, 2, 0),
(11, 6, 'Multi-Touch Attribution Basics', 'Measure channel ROI without vanity metrics.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 490, 1, 1),
(12, 6, 'Retention Loops & Lifecycle Automation', 'Increase LTV through onboarding milestones.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 560, 2, 0),
(13, 7, 'Issue Trees & Hypothesis Testing', 'Break ambiguous strategic questions into testable parts.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 540, 1, 1),
(14, 7, 'Synthesizing Market Data with LLMs', 'Validate assumptions and present board recommendations.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 610, 2, 0),
(15, 8, 'Linking Income, Balance Sheet & Cash Flow', 'Build error-free dynamic financial statements.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 690, 1, 1),
(16, 8, 'Sensitivity Tables & DCF Valuation', 'Stress-test assumptions for executive decisions.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 640, 2, 0),
(17, 9, 'Writing Unbiased Interview Guides', 'Avoid leading questions during customer discovery.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 430, 1, 1),
(18, 9, 'Running Rapid Usability Sessions', 'Synthesize friction points into actionable tickets.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 510, 2, 0),
(19, 10, 'Threat Modeling for Modern Web APIs', 'Identify IDOR, injection, and session risks early.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 590, 1, 1),
(20, 10, 'Signed Webhooks & Rate Limiting', 'Verify HMAC signatures and protect auth endpoints.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 620, 2, 0),
(21, 11, 'Mapping Stakeholder Incentives', 'Align engineering, product, and commercial priorities.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 460, 1, 1),
(22, 11, 'Decision Memos & Async Clarity', 'Run fewer meetings with better written decisions.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 480, 2, 0),
(23, 12, 'Technical Crawlability & Sitemaps', 'Eliminate indexation bottlenecks cleanly.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 470, 1, 1),
(24, 12, 'Optimizing LCP & Structured Data', 'Fast pages that earn rich search snippets.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 530, 2, 0),
(25, 13, 'Cohort Retention & Net Dollar Retention', 'Track sustainable SaaS growth health.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 550, 1, 1),
(26, 13, 'Quarterly Business Reviews That Work', 'Translate metrics into weekly execution.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 500, 2, 0),
(27, 14, '13-Week Cash Flow Forecasting', 'Monitor burn, collections, and runway accurately.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 580, 1, 1),
(28, 14, 'Capital Allocation & Risk Guardrails', 'Balance growth investments with treasury safety.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 590, 2, 0);

INSERT INTO `orders` (`id`, `user_id`, `order_code`, `order_type`, `total`, `currency`, `status`, `gateway_ref`, `payment_method`, `paid_at`) VALUES
(1, 4, 'MK-2026-0001', 'course', 158.00, 'USD', 'paid', 'SBX-TXN-984120', 'sandbox_card', NOW());

INSERT INTO `order_items` (`id`, `order_id`, `course_id`, `item_title`, `price`) VALUES
(1, 1, 1, 'Complete Product Design & Design Systems', 69.00),
(2, 1, 2, 'Fullstack Vue 3, Node.js & MySQL Mastery', 89.00);

INSERT INTO `enrollments` (`id`, `user_id`, `course_id`, `progress_pct`, `last_lesson_id`, `enrolled_at`) VALUES
(1, 4, 1, 50.00, 2, NOW()),
(2, 4, 2, 25.00, 5, NOW());

INSERT INTO `lesson_progress` (`id`, `user_id`, `lesson_id`, `completed_at`) VALUES
(1, 4, 1, NOW()),
(2, 4, 2, NOW()),
(3, 4, 5, NOW());

INSERT INTO `reviews` (`id`, `user_id`, `course_id`, `rating`, `comment`) VALUES
(1, 4, 1, 5, 'Super clear breakdown of design tokens and Figma-to-Tailwind handoff.'),
(2, 4, 2, 5, 'Finally understood parameterized MySQL transactions and clean Pinia state syncing.');

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

INSERT INTO `live_sessions` (`id`, `course_id`, `mentor_id`, `title`, `description`, `starts_at`, `duration_min`, `platform`, `meeting_url`) VALUES
(1, 1, 3, 'Live Critique: Tokenizing Your First Design System', 'Bring your Figma components for live architectural review and Q&A.', DATE_ADD(NOW(), INTERVAL 3 DAY), 60, 'zoom', 'https://zoom.us/j/98765432100'),
(2, 2, 4, 'Office Hours: Scaling Node.js & MySQL Transactions', 'Deep dive into connection pooling, indexes, and zero-downtime API updates.', DATE_ADD(NOW(), INTERVAL 5 DAY), 75, 'google_meet', 'https://meet.google.com/mko-live-dev'),
(3, 5, 1, 'Workshop: Building AI Decision Models for Executives', 'Interactive case study solving real business strategy bottlenecks.', DATE_ADD(NOW(), INTERVAL 7 DAY), 60, 'zoom', 'https://zoom.us/j/98765432199');

INSERT INTO `session_registrations` (`id`, `session_id`, `user_id`) VALUES
(1, 1, 4);

INSERT INTO `community_posts` (`id`, `course_id`, `user_id`, `parent_id`, `body`) VALUES
(1, 1, 4, NULL, 'How do you recommend structuring semantic vs primitive tokens when supporting both light and dark themes?'),
(2, 1, 2, 1, 'Great question! Keep primitive scales neutral and map semantic tokens (surface, text, border) per theme so components never reference raw hex values.');
