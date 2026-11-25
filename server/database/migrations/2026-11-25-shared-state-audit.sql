-- Migrasi 2026-11-25: tabel bersama cache, pencabutan token, dan audit trail admin.
-- Aman dijalankan berulang (idempotent). Tidak menghapus atau mengubah data lama.

CREATE TABLE IF NOT EXISTS `app_cache` (
  `cache_key` varchar(191) NOT NULL,
  `cache_value` mediumtext DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`cache_key`),
  KEY `idx_app_cache_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `access_token_revocations` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `revoked_before` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_audit_log` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `actor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `actor_email` varchar(191) NOT NULL,
  `action` varchar(40) NOT NULL,
  `entity` varchar(60) NOT NULL,
  `entity_id` varchar(60) DEFAULT NULL,
  `detail` mediumtext DEFAULT NULL,
  `ip` varchar(64) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_admin_audit_created` (`created_at`),
  KEY `idx_admin_audit_actor` (`actor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verifikasi: harus mengembalikan 3 baris.
SELECT TABLE_NAME FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND TABLE_NAME IN ('app_cache', 'access_token_revocations', 'admin_audit_log');
