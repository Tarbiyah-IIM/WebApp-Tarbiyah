CREATE TABLE IF NOT EXISTS `media_files` (
  `id` CHAR(36) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(80) NOT NULL,
  `size_bytes` INT UNSIGNED NOT NULL,
  `data` MEDIUMBLOB NOT NULL,
  `uploaded_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_files_uploaded_by` (`uploaded_by`),
  CONSTRAINT `fk_media_files_user`
    FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
