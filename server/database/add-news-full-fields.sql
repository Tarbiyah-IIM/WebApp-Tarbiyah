-- Migrasi penambahan kolom berita lengkap & relasi multi-kategori berita
-- Jalankan file ini di phpMyAdmin (lokal maupun Hostinger) sebelum menggunakan fitur isian lengkap berita.

ALTER TABLE `testimonials`
  ADD COLUMN `full_content` LONGTEXT NULL AFTER `quote`,
  ADD COLUMN `gallery_urls` TEXT NULL AFTER `avatar_url`,
  ADD COLUMN `slideshow_position` ENUM('top', 'bottom', 'none') NOT NULL DEFAULT 'bottom' AFTER `gallery_urls`,
  ADD COLUMN `related_url` VARCHAR(500) NULL AFTER `slideshow_position`;

CREATE TABLE IF NOT EXISTS `testimonial_categories` (
  `testimonial_id` BIGINT(20) UNSIGNED NOT NULL,
  `category_id` BIGINT(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`testimonial_id`, `category_id`),
  KEY `idx_tc_category` (`category_id`),
  CONSTRAINT `fk_tc_testimonial`
    FOREIGN KEY (`testimonial_id`) REFERENCES `testimonials` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tc_category`
    FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `testimonial_categories` (`testimonial_id`, `category_id`)
SELECT `id`, `category_id`
FROM `testimonials`
WHERE `category_id` IS NOT NULL;
