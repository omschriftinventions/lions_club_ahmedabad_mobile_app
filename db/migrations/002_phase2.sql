-- Phase 2 schema additions: chat, meeting minutes, awards, referrals, FAQs,
-- photos (gallery), district news flag, event recaps.
SET FOREIGN_KEY_CHECKS = 0;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- chat_threads â€” 1:1 DM or group thread
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS chat_threads (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_id    INT UNSIGNED NOT NULL,
  title      VARCHAR(120) NULL,         -- NULL = DM, set = group title
  is_group   TINYINT(1)   NOT NULL DEFAULT 0,
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_thread_club (club_id),
  CONSTRAINT fk_thread_club FOREIGN KEY (club_id)    REFERENCES clubs(id)   ON DELETE CASCADE,
  CONSTRAINT fk_thread_creat FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_members (
  thread_id INT UNSIGNED NOT NULL,
  member_id INT UNSIGNED NOT NULL,
  last_read BIGINT UNSIGNED NULL,        -- last message id read
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (thread_id, member_id),
  KEY idx_cm_member (member_id),
  CONSTRAINT fk_cm_thread FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE,
  CONSTRAINT fk_cm_member FOREIGN KEY (member_id) REFERENCES members(id)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  thread_id  INT UNSIGNED NOT NULL,
  sender_id  INT UNSIGNED NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_msg_thread (thread_id, id),
  CONSTRAINT fk_msg_thread FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES members(id)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- meeting_minutes
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS meeting_minutes (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_id     INT UNSIGNED NOT NULL,
  title       VARCHAR(200) NOT NULL,
  meeting_date DATE NOT NULL,
  attendees   INT NULL,
  body        MEDIUMTEXT NULL,
  doc_url     VARCHAR(255) NULL,
  created_by  INT UNSIGNED NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mm_club_date (club_id, meeting_date),
  CONSTRAINT fk_mm_club  FOREIGN KEY (club_id)    REFERENCES clubs(id)   ON DELETE CASCADE,
  CONSTRAINT fk_mm_creat FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- awards
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS awards (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_id     INT UNSIGNED NOT NULL,
  member_id   INT UNSIGNED NULL,           -- NULL = club award
  name        VARCHAR(160) NOT NULL,
  category    VARCHAR(80)  NULL,           -- PMJF, MJF, District Award, etc.
  awarded_on  DATE NULL,
  description TEXT NULL,
  icon        VARCHAR(8) NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_award_club (club_id),
  KEY idx_award_member (member_id),
  CONSTRAINT fk_award_club   FOREIGN KEY (club_id)   REFERENCES clubs(id)   ON DELETE CASCADE,
  CONSTRAINT fk_award_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- referrals â€” "Refer a Lion"
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS referrals (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_id       INT UNSIGNED NOT NULL,
  referred_by   INT UNSIGNED NOT NULL,
  candidate_name  VARCHAR(160) NOT NULL,
  candidate_phone VARCHAR(20) NULL,
  candidate_email VARCHAR(160) NULL,
  candidate_profession VARCHAR(160) NULL,
  notes         TEXT NULL,
  status        ENUM('new','contacted','inducted','declined') NOT NULL DEFAULT 'new',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ref_club (club_id),
  CONSTRAINT fk_ref_club FOREIGN KEY (club_id)     REFERENCES clubs(id)   ON DELETE CASCADE,
  CONSTRAINT fk_ref_by   FOREIGN KEY (referred_by) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- faqs
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS faqs (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_id    INT UNSIGNED NOT NULL,
  question   VARCHAR(400) NOT NULL,
  answer     TEXT NOT NULL,
  category   VARCHAR(60) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_faq_club (club_id),
  CONSTRAINT fk_faq_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- photos â€” gallery (URL-based; S3 wiring later)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS photos (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_id       INT UNSIGNED NOT NULL,
  event_id      INT UNSIGNED NULL,
  project_id    INT UNSIGNED NULL,
  url           VARCHAR(500) NOT NULL,
  caption       VARCHAR(300) NULL,
  uploaded_by   INT UNSIGNED NULL,
  taken_at      DATETIME NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_photo_club (club_id, created_at),
  KEY idx_photo_event (event_id),
  KEY idx_photo_project (project_id),
  CONSTRAINT fk_photo_club    FOREIGN KEY (club_id)     REFERENCES clubs(id)            ON DELETE CASCADE,
  CONSTRAINT fk_photo_event   FOREIGN KEY (event_id)    REFERENCES events(id)           ON DELETE SET NULL,
  CONSTRAINT fk_photo_project FOREIGN KEY (project_id)  REFERENCES service_projects(id) ON DELETE SET NULL,
  CONSTRAINT fk_photo_by      FOREIGN KEY (uploaded_by) REFERENCES members(id)          ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- news.scope ('club' | 'district') â€” extend existing news instead of new table
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE news
  ADD COLUMN scope ENUM('club','district') NOT NULL DEFAULT 'club' AFTER published_at;

CREATE INDEX idx_news_scope ON news(club_id, scope, published_at);

SET FOREIGN_KEY_CHECKS = 1;
