CREATE TABLE IF NOT EXISTS `news_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_news_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `testimonials`
  ADD COLUMN `category_id` BIGINT UNSIGNED NULL AFTER `job_title`,
  ADD KEY `idx_testimonials_category` (`category_id`),
  ADD CONSTRAINT `fk_testimonials_news_category`
    FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`id`) ON DELETE RESTRICT;

INSERT INTO `news_categories` (`name`) VALUES
  ('Akademik'),
  ('Benchmarking'),
  ('Akreditasi')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
