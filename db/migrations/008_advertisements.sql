-- 008_advertisements.sql — Advertisement management
-- Admin can upload banner images shown on dashboard and/or login page

CREATE TABLE IF NOT EXISTS advertisements (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  club_id     INT NOT NULL,
  image_url   VARCHAR(500) NOT NULL,
  title       VARCHAR(255) NULL,
  link_url    VARCHAR(500) NULL,
  placement   ENUM('dashboard','login','both') NOT NULL DEFAULT 'both',
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_by  INT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ad_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  CONSTRAINT fk_ad_creator FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_ad_club_active ON advertisements(club_id, is_active, sort_order);
