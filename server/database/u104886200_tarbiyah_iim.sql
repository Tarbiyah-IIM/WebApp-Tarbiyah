-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Waktu pembuatan: 23 Nov 2026 pada 06.14
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
-- Struktur dari tabel `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'UI/UX Design', 'ui-ux-design', 'Product design, Figma systems, user research, and interactive prototyping.', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(2, 'Web Development', 'web-development', 'Modern frontend, backend APIs, databases, and production deployment.', 2, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(3, 'Marketing & Communication', 'marketing-communication', 'Brand storytelling, PR strategy, and executive communication.', 3, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(4, 'Digital Marketing', 'digital-marketing', 'Performance ads, SEO, lifecycle retention, and analytics.', 4, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(5, 'Business Consulting', 'business-consulting', 'Operations strategy, management frameworks, and client advisory.', 5, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(6, 'Finance Management', 'finance-management', 'Corporate finance, financial modeling, budgeting, and risk analysis.', 6, '2026-11-20 10:13:21', '2026-11-20 10:13:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `certificates`
--

CREATE TABLE `certificates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `certificate_code` varchar(64) NOT NULL,
  `issued_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `community_posts`
--

CREATE TABLE `community_posts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `body` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `mentor_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `level` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `badge` varchar(60) DEFAULT NULL,
  `total_videos` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `duration_hours` decimal(5,1) NOT NULL DEFAULT 0.0,
  `rating_avg` decimal(3,2) NOT NULL DEFAULT 0.00,
  `rating_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `approval_status` enum('draft','pending_review','approved','rejected') NOT NULL DEFAULT 'approved',
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `courses`
--

INSERT INTO `courses` (`id`, `category_id`, `mentor_id`, `title`, `slug`, `subtitle`, `description`, `level`, `price`, `currency`, `thumbnail_url`, `badge`, `total_videos`, `duration_hours`, `rating_avg`, `rating_count`, `approval_status`, `is_published`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 'Complete Product Design & Design Systems', 'complete-product-design-systems', 'Build scalable Figma component libraries and ship production-ready UI.', 'Master end-to-end UI/UX workflows from user discovery and wireframing to tokenized design systems and developer handoff.', 'beginner', 69.00, 'USD', 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=900&q=80', 'Best Seller', 4, 14.5, 4.90, 1, 'approved', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(2, 2, 4, 'Fullstack Vue 3, Node.js & MySQL Mastery', 'fullstack-vue-nodejs-mysql', 'Architect fast, secure web apps with REST APIs and relational schemas.', 'Learn modern Composition API, Pinia state management, Express REST APIs, JWT authentication, and parameterized MySQL queries.', 'intermediate', 89.00, 'USD', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80', 'Top Ranked', 4, 22.0, 4.85, 1, 'approved', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(3, 3, 5, 'Strategic Brand Communication & Storytelling', 'strategic-brand-communication', 'Craft high-impact narratives that convert audiences and align teams.', 'Practical frameworks for executive presentations, brand positioning, crisis communication, and multi-channel messaging.', 'beginner', 49.00, 'USD', 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80', 'Popular', 2, 9.5, 4.75, 0, 'approved', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(4, 4, 5, 'Performance Digital Marketing & Growth Analytics', 'performance-digital-marketing', 'Scale acquisition profitably with attribution, SEO, and lifecycle funnels.', 'Build measurable campaigns across search, social, and email automation backed by cohort analysis and conversion experiments.', 'intermediate', 59.00, 'USD', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80', 'Best Seller', 2, 12.0, 4.80, 0, 'approved', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(5, 5, 1, 'AI-Driven Business Consulting & Strategy', 'ai-driven-business-consulting', 'Solve complex enterprise problems with structured frameworks and AI.', 'Combine classic consulting problem trees with modern data modeling to deliver actionable growth roadmaps.', 'advanced', 99.00, 'USD', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80', 'Top Ranked', 2, 16.0, 4.95, 0, 'approved', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(6, 6, 6, 'Corporate Finance Modeling & Valuation', 'corporate-finance-modeling', 'Build three-statement models, DCF valuations, and board-ready dashboards.', 'Hands-on spreadsheet and scenario modeling techniques used by investment analysts and CFO teams.', 'intermediate', 79.00, 'USD', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80', 'New Release', 2, 15.0, 4.70, 0, 'approved', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(7, 1, 3, 'UX Research & Usability Testing Lab', 'ux-research-usability-testing', 'Turn qualitative interviews into measurable product improvements.', 'Design interview scripts, run moderated usability sessions, synthesize insights, and prioritize roadmap bets.', 'beginner', 54.00, 'USD', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=900&q=80', 'Popular', 2, 10.0, 4.80, 0, 'approved', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(8, 2, 2, 'Web Security & Resilient Cloud APIs', 'web-security-resilient-apis', 'Harden Node.js backends against OWASP Top 10 and scale reliably.', 'Implement rate limiting, token rotation, SQL injection defense, webhook HMAC verification, and automated security checks.', 'advanced', 94.00, 'USD', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80', 'Top Ranked', 2, 18.0, 4.92, 0, 'approved', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(9, 3, 5, 'Executive Leadership & Stakeholder Alignment', 'executive-leadership-alignment', 'Lead cross-functional initiatives with clarity and influence.', 'Develop persuasive communication habits, conflict resolution playbooks, and clear strategic briefs.', 'intermediate', 45.00, 'USD', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80', NULL, 2, 8.5, 4.65, 0, 'approved', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(10, 4, 5, 'Technical SEO & Content Engine Architecture', 'technical-seo-content-engine', 'Capture compounding organic traffic with structured topic clusters.', 'Audit crawlability, Core Web Vitals, schema markup, and editorial workflows built for sustainable growth.', 'beginner', 52.00, 'USD', 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=900&q=80', 'Popular', 2, 11.0, 4.78, 0, 'approved', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(11, 5, 6, 'SaaS Unit Economics & Operations Playbook', 'saas-unit-economics-operations', 'Optimize LTV, CAC, churn, and operational cadence for growing teams.', 'Practical benchmarks and operating cadences for founders, COOs, and business consultants.', 'intermediate', 84.00, 'USD', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80', 'Best Seller', 2, 13.5, 4.88, 0, 'approved', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(12, 6, 6, 'Treasury, Cash Flow & Risk Management', 'treasury-cashflow-risk-management', 'Protect working capital and forecast liquidity under uncertainty.', 'Build rolling 13-week cash forecasts, FX hedging basics, and capital allocation scorecards.', 'advanced', 74.00, 'USD', 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=900&q=80', NULL, 2, 12.5, 4.72, 0, 'approved', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `enrollments`
--

CREATE TABLE `enrollments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `progress_pct` decimal(5,2) NOT NULL DEFAULT 0.00,
  `last_lesson_id` bigint(20) UNSIGNED DEFAULT NULL,
  `enrolled_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Struktur dari tabel `learning_paths`
--

CREATE TABLE `learning_paths` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `goal_title` varchar(160) NOT NULL,
  `interest_category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `target_level` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `learning_path_items`
--

CREATE TABLE `learning_path_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `path_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `lessons`
--

CREATE TABLE `lessons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `section_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `summary` text DEFAULT NULL,
  `video_url` varchar(500) NOT NULL,
  `duration_sec` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_preview` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `lessons`
--

INSERT INTO `lessons` (`id`, `section_id`, `title`, `summary`, `video_url`, `duration_sec`, `sort_order`, `is_preview`, `created_at`, `updated_at`) VALUES
(1, 1, 'Why Design Tokens Matter at Scale', 'Understand semantic naming for colors, spacing, and typography.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 420, 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(2, 1, 'Auditing Existing UI Patterns', 'Inventory components and eliminate visual drift across teams.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 540, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(3, 2, 'Building Accessible Variants in Figma', 'Interactive states, focus rings, and WCAG contrast verification.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 600, 1, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(4, 2, 'Developer Handoff & Documentation', 'Sync tokens with Tailwind CSS config cleanly.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 480, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(5, 3, 'Designing Normalized MySQL 8 Schemas', 'Indexes, foreign keys, and transactional integrity.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 630, 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(6, 3, 'Parameterized Queries & Zod Validation', 'Prevent SQL injection and validate payloads cleanly.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 580, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(7, 4, 'Pinia Stores & Token Refresh Interceptors', 'Keep auth state synchronized across tabs and dashboards.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 660, 1, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(8, 4, 'Deployment & Error Observability', 'Build verification, health checks, and clean logs.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 510, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(9, 5, 'Positioning Your Core Brand Promise', 'Define clarity before scaling campaigns.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 450, 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(10, 5, 'Executive Storytelling Structure', 'Persuasive decks that win stakeholder buy-in.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 520, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(11, 6, 'Multi-Touch Attribution Basics', 'Measure channel ROI without vanity metrics.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 490, 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(12, 6, 'Retention Loops & Lifecycle Automation', 'Increase LTV through onboarding milestones.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 560, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(13, 7, 'Issue Trees & Hypothesis Testing', 'Break ambiguous strategic questions into testable parts.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 540, 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(14, 7, 'Synthesizing Market Data with LLMs', 'Validate assumptions and present board recommendations.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 610, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(15, 8, 'Linking Income, Balance Sheet & Cash Flow', 'Build error-free dynamic financial statements.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 690, 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(16, 8, 'Sensitivity Tables & DCF Valuation', 'Stress-test assumptions for executive decisions.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 640, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(17, 9, 'Writing Unbiased Interview Guides', 'Avoid leading questions during customer discovery.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 430, 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(18, 9, 'Running Rapid Usability Sessions', 'Synthesize friction points into actionable tickets.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 510, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(19, 10, 'Threat Modeling for Modern Web APIs', 'Identify IDOR, injection, and session risks early.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 590, 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(20, 10, 'Signed Webhooks & Rate Limiting', 'Verify HMAC signatures and protect auth endpoints.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 620, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(21, 11, 'Mapping Stakeholder Incentives', 'Align engineering, product, and commercial priorities.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 460, 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(22, 11, 'Decision Memos & Async Clarity', 'Run fewer meetings with better written decisions.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 480, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(23, 12, 'Technical Crawlability & Sitemaps', 'Eliminate indexation bottlenecks cleanly.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 470, 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(24, 12, 'Optimizing LCP & Structured Data', 'Fast pages that earn rich search snippets.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 530, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(25, 13, 'Cohort Retention & Net Dollar Retention', 'Track sustainable SaaS growth health.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 550, 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(26, 13, 'Quarterly Business Reviews That Work', 'Translate metrics into weekly execution.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 500, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(27, 14, '13-Week Cash Flow Forecasting', 'Monitor burn, collections, and runway accurately.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 580, 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(28, 14, 'Capital Allocation & Risk Guardrails', 'Balance growth investments with treasury safety.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4', 590, 2, 0, '2026-11-20 10:13:21', '2026-11-20 10:13:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `completed_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `live_sessions`
--

CREATE TABLE `live_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `mentor_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `starts_at` datetime NOT NULL,
  `duration_min` int(10) UNSIGNED NOT NULL DEFAULT 60,
  `platform` enum('zoom','google_meet') NOT NULL DEFAULT 'zoom',
  `meeting_url` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `live_sessions`
--

INSERT INTO `live_sessions` (`id`, `course_id`, `mentor_id`, `title`, `description`, `starts_at`, `duration_min`, `platform`, `meeting_url`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 'Live Critique: Tokenizing Your First Design System', 'Bring your Figma components for live architectural review and Q&A.', '2026-11-23 10:13:21', 60, 'zoom', 'https://zoom.us/j/98765432100', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(2, 2, 4, 'Office Hours: Scaling Node.js & MySQL Transactions', 'Deep dive into connection pooling, indexes, and zero-downtime API updates.', '2026-11-25 10:13:21', 75, 'google_meet', 'https://meet.google.com/mko-live-dev', '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(3, 5, 1, 'Workshop: Building AI Decision Models for Executives', 'Interactive case study solving real business strategy bottlenecks.', '2026-11-27 10:13:21', 60, 'zoom', 'https://zoom.us/j/98765432199', '2026-11-20 10:13:21', '2026-11-20 10:13:21');

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
-- Struktur dari tabel `mentors`
--

CREATE TABLE `mentors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `title` varchar(160) NOT NULL,
  `bio` text DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `mentors`
--

INSERT INTO `mentors` (`id`, `user_id`, `name`, `title`, `bio`, `photo_url`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Sarah Johnson', 'AI Expert & Data Scientist', 'Former Principal Data Scientist leading enterprise NLP and predictive analytics platforms.', 'https://api.dicebear.com/9.x/avataaars/svg?seed=SarahJohnson', 1, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(2, NULL, 'Marcus Vance', 'Cybersecurity Specialist', 'Security architect specializing in zero-trust web infrastructure and DevSecOps.', 'https://api.dicebear.com/9.x/avataaars/svg?seed=MarcusVance', 2, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(3, NULL, 'Elena Rostova', 'Lead Product Designer', 'Design systems director crafting accessible SaaS interfaces for global teams.', 'https://api.dicebear.com/9.x/avataaars/svg?seed=ElenaRostova', 3, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(4, NULL, 'Daniel Kim', 'Principal Fullstack Engineer', 'Built high-throughput Node.js and Vue platforms serving millions of learners.', 'https://api.dicebear.com/9.x/avataaars/svg?seed=DanielKim', 4, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(5, NULL, 'Maya Lin', 'Growth Marketing Director', 'Scaled B2B and consumer SaaS funnels across North America and Southeast Asia.', 'https://api.dicebear.com/9.x/avataaars/svg?seed=MayaLin', 5, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(6, NULL, 'David Thorne', 'Corporate Finance Strategist', 'Financial modeling advisor helping founders and analysts master valuation.', 'https://api.dicebear.com/9.x/avataaars/svg?seed=DavidThorne', 6, 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21');

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
-- Struktur dari tabel `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `order_code` varchar(40) NOT NULL,
  `order_type` enum('course','subscription') NOT NULL DEFAULT 'course',
  `total` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `gateway_ref` varchar(120) DEFAULT NULL,
  `payment_method` varchar(60) NOT NULL DEFAULT 'sandbox_card',
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED DEFAULT NULL,
  `item_title` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Struktur dari tabel `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `sections`
--

CREATE TABLE `sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `sections`
--

INSERT INTO `sections` (`id`, `course_id`, `title`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Foundations of Design Systems', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(2, 1, 'Component Architecture & Handoff', 2, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(3, 2, 'Relational Data & Express API Core', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(4, 2, 'Vue 3 Pinia State & Production Security', 2, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(5, 3, 'Narrative Frameworks', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(6, 4, 'Acquisition & Funnel Attribution', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(7, 5, 'Structured Problem Solving with AI', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(8, 6, 'Three-Statement Financial Modeling', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(9, 7, 'Discovery & Usability Protocols', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(10, 8, 'API Hardening & Zero-Trust Auth', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(11, 9, 'Influence Without Authority', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(12, 10, 'Crawl Architecture & Core Web Vitals', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(13, 11, 'SaaS Metrics & Operating Cadence', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21'),
(14, 12, 'Liquidity Forecasting & Risk Controls', 1, '2026-11-20 10:13:21', '2026-11-20 10:13:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `session_registrations`
--

CREATE TABLE `session_registrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `session_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Struktur dari tabel `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `plan` varchar(60) NOT NULL DEFAULT 'premium_annual',
  `price` decimal(10,2) NOT NULL DEFAULT 160.00,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `status` enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
  `auto_renew` tinyint(1) NOT NULL DEFAULT 1,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime NOT NULL,
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
  `rating` tinyint(3) UNSIGNED NOT NULL DEFAULT 5,
  `avatar_url` varchar(500) DEFAULT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
-- Indeks untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_categories_slug` (`slug`);

--
-- Indeks untuk tabel `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_certificates_code` (`certificate_code`),
  ADD UNIQUE KEY `uq_cert_user_course` (`user_id`,`course_id`),
  ADD KEY `fk_certificates_course` (`course_id`);

--
-- Indeks untuk tabel `community_posts`
--
ALTER TABLE `community_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_community_course` (`course_id`),
  ADD KEY `fk_community_user` (`user_id`),
  ADD KEY `fk_community_parent` (`parent_id`);

--
-- Indeks untuk tabel `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_courses_slug` (`slug`),
  ADD KEY `idx_courses_cat_pub` (`category_id`,`is_published`),
  ADD KEY `idx_courses_approval` (`approval_status`,`is_published`),
  ADD KEY `fk_courses_mentor` (`mentor_id`);

--
-- Indeks untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_enrollment_user_course` (`user_id`,`course_id`),
  ADD KEY `idx_enrollments_user` (`user_id`),
  ADD KEY `fk_enrollments_course` (`course_id`),
  ADD KEY `fk_enrollments_last_lesson` (`last_lesson_id`);

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
-- Indeks untuk tabel `learning_paths`
--
ALTER TABLE `learning_paths`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_learning_paths_user` (`user_id`),
  ADD KEY `fk_learning_paths_category` (`interest_category_id`);

--
-- Indeks untuk tabel `learning_path_items`
--
ALTER TABLE `learning_path_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lp_items_path` (`path_id`),
  ADD KEY `fk_lp_items_course` (`course_id`);

--
-- Indeks untuk tabel `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lessons_section` (`section_id`);

--
-- Indeks untuk tabel `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_lesson_progress` (`user_id`,`lesson_id`),
  ADD KEY `idx_lesson_progress_user_lesson` (`user_id`,`lesson_id`),
  ADD KEY `fk_lesson_progress_lesson` (`lesson_id`);

--
-- Indeks untuk tabel `live_sessions`
--
ALTER TABLE `live_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_live_sessions_course` (`course_id`),
  ADD KEY `fk_live_sessions_mentor` (`mentor_id`);

--
-- Indeks untuk tabel `media_files`
--
ALTER TABLE `media_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_media_files_uploaded_by` (`uploaded_by`);

--
-- Indeks untuk tabel `mentors`
--
ALTER TABLE `mentors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_mentors_user` (`user_id`);

--
-- Indeks untuk tabel `news_categories`
--
ALTER TABLE `news_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_news_categories_name` (`name`);

--
-- Indeks untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_orders_code` (`order_code`),
  ADD KEY `idx_orders_user_status` (`user_id`,`status`);

--
-- Indeks untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order` (`order_id`),
  ADD KEY `fk_order_items_course` (`course_id`);

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
-- Indeks untuk tabel `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_reviews_user_course` (`user_id`,`course_id`),
  ADD KEY `fk_reviews_course` (`course_id`);

--
-- Indeks untuk tabel `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sections_course` (`course_id`);

--
-- Indeks untuk tabel `session_registrations`
--
ALTER TABLE `session_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_session_user` (`session_id`,`user_id`),
  ADD KEY `fk_session_reg_user` (`user_id`);

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
-- Indeks untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subscriptions_user` (`user_id`);

--
-- Indeks untuk tabel `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_testimonials_category` (`category_id`);

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
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `community_posts`
--
ALTER TABLE `community_posts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
-- AUTO_INCREMENT untuk tabel `learning_paths`
--
ALTER TABLE `learning_paths`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `learning_path_items`
--
ALTER TABLE `learning_path_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT untuk tabel `lesson_progress`
--
ALTER TABLE `lesson_progress`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `live_sessions`
--
ALTER TABLE `live_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `mentors`
--
ALTER TABLE `mentors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `news_categories`
--
ALTER TABLE `news_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
-- AUTO_INCREMENT untuk tabel `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `sections`
--
ALTER TABLE `sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `session_registrations`
--
ALTER TABLE `session_registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- AUTO_INCREMENT untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
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
-- Ketidakleluasaan untuk tabel `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `fk_certificates_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_certificates_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `community_posts`
--
ALTER TABLE `community_posts`
  ADD CONSTRAINT `fk_community_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_community_parent` FOREIGN KEY (`parent_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_community_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `fk_courses_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `fk_courses_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`);

--
-- Ketidakleluasaan untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_enrollments_last_lesson` FOREIGN KEY (`last_lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `learning_paths`
--
ALTER TABLE `learning_paths`
  ADD CONSTRAINT `fk_learning_paths_category` FOREIGN KEY (`interest_category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_learning_paths_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `learning_path_items`
--
ALTER TABLE `learning_path_items`
  ADD CONSTRAINT `fk_lp_items_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lp_items_path` FOREIGN KEY (`path_id`) REFERENCES `learning_paths` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `fk_lessons_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `fk_lesson_progress_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lesson_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `live_sessions`
--
ALTER TABLE `live_sessions`
  ADD CONSTRAINT `fk_live_sessions_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_live_sessions_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `media_files`
--
ALTER TABLE `media_files`
  ADD CONSTRAINT `fk_media_files_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `mentors`
--
ALTER TABLE `mentors`
  ADD CONSTRAINT `fk_mentors_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

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
-- Ketidakleluasaan untuk tabel `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `fk_sections_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `session_registrations`
--
ALTER TABLE `session_registrations`
  ADD CONSTRAINT `fk_session_reg_session` FOREIGN KEY (`session_id`) REFERENCES `live_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_session_reg_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `testimonials`
--
ALTER TABLE `testimonials`
  ADD CONSTRAINT `fk_testimonials_news_category` FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
