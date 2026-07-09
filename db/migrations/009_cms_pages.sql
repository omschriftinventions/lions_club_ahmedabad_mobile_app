-- 009_cms_pages.sql CMS pages (admin-editable rich content, e.g. History)
CREATE TABLE IF NOT EXISTS cms_pages (
  slug        VARCHAR(50) NOT NULL PRIMARY KEY,
  html        LONGTEXT NOT NULL,
  updated_by  INT UNSIGNED NULL,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cms_creator FOREIGN KEY (updated_by) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO cms_pages (slug, html) VALUES
  ('history', '<p>The history of Lions Club of Ahmedabad Host will appear here once an admin publishes it.</p>');