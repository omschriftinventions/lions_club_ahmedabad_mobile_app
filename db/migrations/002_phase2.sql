-- Phase 2 schema additions: chat, meeting minutes, awards, referrals, FAQs,
-- photos (gallery), district news flag, event recaps.
SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────────────────────
-- chat_threads — 1:1 DM or group thread
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- meeting_minutes
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- awards
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- referrals — "Refer a Lion"
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- faqs
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- photos — gallery (URL-based; S3 wiring later)
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- news.scope ('club' | 'district') — extend existing news instead of new table
-- ─────────────────────────────────────────────────────────────
ALTER TABLE news
  ADD COLUMN scope ENUM('club','district') NOT NULL DEFAULT 'club' AFTER published_at;

CREATE INDEX idx_news_scope ON news(club_id, scope, published_at);

SET FOREIGN_KEY_CHECKS = 1;

-- ─────────────────────────────────────────────────────────────
-- seed
-- ─────────────────────────────────────────────────────────────
INSERT INTO faqs (club_id, question, answer, category, sort_order) VALUES
  (1, 'How do I update my profile?',         'Open Profile tab → Edit profile.',                       'Profile',   10),
  (1, 'How do I RSVP to an event?',          'Events tab → tap event → choose Yes / Maybe / Can''t make it.', 'Events', 20),
  (1, 'What do PMJF and MJF mean?',          'PMJF = Progressive Melvin Jones Fellow. MJF = Melvin Jones Fellow. LCIF donor designations.', 'About', 30),
  (1, 'Who can publish announcements?',      'President, Secretary, and Treasurer.',                    'Roles',     40),
  (1, 'How do referrals work?',              'Refer a Lion screen → submit candidate details. Membership Chair follows up.', 'Membership', 50)
ON DUPLICATE KEY UPDATE question = VALUES(question);

INSERT INTO awards (club_id, member_id, name, category, awarded_on, description, icon) VALUES
  (1, 1, 'PMJF — Progressive Melvin Jones Fellow', 'LCIF',   '2019-08-12', 'Awarded for sustained contribution to LCIF.', '🏅'),
  (1, 5, 'PMJF',                                    'LCIF',   '2020-11-30', 'Cumulative contributions.',                  '🏅'),
  (1, NULL, 'Best Club Bulletin — District 323-H',  'District', '2024-06-15', 'Awarded at District Convention.',          '🏆'),
  (1, NULL, '100% Attendance Banner Patch',         'District', '2023-05-20', 'Year of perfect officer attendance.',      '🎖')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO meeting_minutes (club_id, title, meeting_date, attendees, body, created_by) VALUES
  (1, 'Board Meeting — May 2026',  '2026-05-06', 9, 'Discussed Charter Night. Budget approved for eye camp. New member induction Jun 14.', 1),
  (1, 'Stated Meeting — Apr 2026', '2026-04-15', 22, 'Service Chair shared impact: 320 cataract surgeries to date. Treasurer presented Q4 statement.', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO news (club_id, title, tag, excerpt, body, published_at, scope) VALUES
  (1, 'District 323-H Annual Convention dates announced', 'District', 'Convention scheduled for September 12-14 in Surat. Registration opens July 1.', 'Full convention agenda to be circulated by July. Early-bird registration ends July 31.', NOW() - INTERVAL 2 DAY, 'district'),
  (1, 'New service grant from LCIF for vision program',  'District', 'LCIF approves ₹18L for district-wide vision restoration project.', 'All clubs in 323-H invited to participate in screening drives Aug-Oct.', NOW() - INTERVAL 5 DAY, 'district');
