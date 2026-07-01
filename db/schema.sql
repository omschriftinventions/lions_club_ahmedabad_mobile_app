-- Lions Club Ahmedabad — MySQL Schema
-- MySQL 8.0+, utf8mb4
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────────────────────
-- clubs (single-tenant for now; future-proof for districts)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clubs (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(160) NOT NULL,
  district     VARCHAR(60)  NOT NULL,
  charter_year INT          NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- roles  (President, Secretary, Treasurer, VP, Member, etc.)
-- can_edit_club_data flag drives RBAC
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code                VARCHAR(40)  NOT NULL UNIQUE,
  label               VARCHAR(60)  NOT NULL,
  color               CHAR(7)      NOT NULL DEFAULT '#6B7785',
  can_edit_club_data  TINYINT(1)   NOT NULL DEFAULT 0,
  can_manage_members  TINYINT(1)   NOT NULL DEFAULT 0,
  can_manage_finance  TINYINT(1)   NOT NULL DEFAULT 0,
  rank_order          INT          NOT NULL DEFAULT 100,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- members
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_id       INT UNSIGNED NOT NULL,
  role_id       INT UNSIGNED NOT NULL,
  name          VARCHAR(160) NOT NULL,
  initials      VARCHAR(6)   NULL,
  designation   VARCHAR(40)  NULL,  -- PMJF, MJF, etc.
  profession    VARCHAR(120) NULL,
  business      VARCHAR(160) NULL,
  area          VARCHAR(120) NULL,
  phone         VARCHAR(20)  NULL,
  phone_e164    VARCHAR(20)  NULL,  -- normalized for OTP lookup
  email         VARCHAR(160) NULL,
  joined_year   INT          NULL,
  dob           VARCHAR(20)  NULL,  -- "Mar 14" — privacy-safe (no year)
  dob_date      DATE         NULL,  -- optional full date
  anniv         VARCHAR(20)  NULL,
  spouse        VARCHAR(120) NULL,
  avatar_color  CHAR(7)      NULL,
  avatar_url    VARCHAR(255) NULL,
  bio           TEXT         NULL,
  expertise      TEXT         NULL,  -- E-GAINS: Expertise
  goals          TEXT         NULL,  -- E-GAINS: Goals
  accomplishments TEXT         NULL,  -- E-GAINS: Accomplishments
  interests      TEXT         NULL,  -- E-GAINS: Interests
  network        TEXT         NULL,  -- E-GAINS: Network
  social         TEXT         NULL,  -- E-GAINS: Social connections
  active        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_member_phone (phone_e164),
  KEY idx_member_club (club_id),
  KEY idx_member_role (role_id),
  KEY idx_member_name (name),
  CONSTRAINT fk_member_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  CONSTRAINT fk_member_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- otps  (phone OTP flow)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otps (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  phone_e164  VARCHAR(20)  NOT NULL,
  code_hash   VARCHAR(255) NOT NULL,
  expires_at  DATETIME     NOT NULL,
  attempts    INT          NOT NULL DEFAULT 0,
  consumed_at DATETIME     NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_otp_phone (phone_e164),
  KEY idx_otp_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- sessions  (JWT refresh tokens — revocation list)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  member_id    INT UNSIGNED NOT NULL,
  refresh_hash VARCHAR(255) NOT NULL,
  user_agent   VARCHAR(255) NULL,
  ip           VARCHAR(45)  NULL,
  expires_at   DATETIME     NOT NULL,
  revoked_at   DATETIME     NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_session_member (member_id),
  CONSTRAINT fk_session_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- push_tokens
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_tokens (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  member_id   INT UNSIGNED NOT NULL,
  expo_token  VARCHAR(255) NOT NULL,
  platform    ENUM('ios','android','web') NOT NULL,
  device_name VARCHAR(120) NULL,
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_push_token (expo_token),
  KEY idx_push_member (member_id),
  CONSTRAINT fk_push_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- causes
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS causes (
  id         VARCHAR(40)  NOT NULL,
  name       VARCHAR(80)  NOT NULL,
  icon       VARCHAR(8)   NULL,
  units      VARCHAR(40)  NULL,
  unit_label VARCHAR(80)  NULL,
  color      CHAR(7)      NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- events
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_id     INT UNSIGNED NOT NULL,
  title       VARCHAR(200) NOT NULL,
  type        ENUM('Signature','Service','Meeting','Fellowship','Other') NOT NULL DEFAULT 'Other',
  starts_at   DATETIME     NOT NULL,
  ends_at     DATETIME     NULL,
  venue       VARCHAR(200) NULL,
  description TEXT         NULL,
  cause_id    VARCHAR(40)  NULL,
  cover_url   VARCHAR(255) NULL,
  created_by  INT UNSIGNED NULL,
  cancelled   TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_event_club (club_id),
  KEY idx_event_starts (starts_at),
  CONSTRAINT fk_event_club  FOREIGN KEY (club_id)    REFERENCES clubs(id)   ON DELETE CASCADE,
  CONSTRAINT fk_event_cause FOREIGN KEY (cause_id)   REFERENCES causes(id)  ON DELETE SET NULL,
  CONSTRAINT fk_event_creat FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- rsvps
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsvps (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_id   INT UNSIGNED NOT NULL,
  member_id  INT UNSIGNED NOT NULL,
  status     ENUM('yes','no','maybe') NOT NULL DEFAULT 'yes',
  note       VARCHAR(255) NULL,
  guests     INT NOT NULL DEFAULT 0,
  attended   TINYINT(1) NOT NULL DEFAULT 0,
  attended_at DATETIME NULL,
  marked_by  INT UNSIGNED NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rsvp (event_id, member_id),
  CONSTRAINT fk_rsvp_event  FOREIGN KEY (event_id)  REFERENCES events(id)  ON DELETE CASCADE,
  CONSTRAINT fk_rsvp_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- news / announcements
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_id     INT UNSIGNED NOT NULL,
  title       VARCHAR(200) NOT NULL,
  tag         VARCHAR(40)  NULL,
  excerpt     VARCHAR(400) NULL,
  body        MEDIUMTEXT   NULL,
  cover_url   VARCHAR(255) NULL,
  published   TINYINT(1)   NOT NULL DEFAULT 1,
  published_at DATETIME    NULL,
  author_id   INT UNSIGNED NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_news_club (club_id),
  KEY idx_news_pub (published_at),
  CONSTRAINT fk_news_club   FOREIGN KEY (club_id)   REFERENCES clubs(id)   ON DELETE CASCADE,
  CONSTRAINT fk_news_author FOREIGN KEY (author_id) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- service_projects  (per-cause impact tracking)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_projects (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_id     INT UNSIGNED NOT NULL,
  cause_id    VARCHAR(40)  NOT NULL,
  title       VARCHAR(200) NOT NULL,
  units       INT          NOT NULL DEFAULT 0,
  amount_inr  DECIMAL(12,2) NOT NULL DEFAULT 0,
  occurred_on DATE         NULL,
  notes       TEXT         NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sp_club (club_id),
  KEY idx_sp_cause (cause_id),
  CONSTRAINT fk_sp_club  FOREIGN KEY (club_id)  REFERENCES clubs(id)  ON DELETE CASCADE,
  CONSTRAINT fk_sp_cause FOREIGN KEY (cause_id) REFERENCES causes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- notifications  (per-member inbox feed)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  member_id  INT UNSIGNED NOT NULL,
  type       VARCHAR(40)  NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       VARCHAR(500) NULL,
  icon       VARCHAR(8)   NULL,
  ref_table  VARCHAR(40)  NULL,
  ref_id     BIGINT       NULL,
  read_at    DATETIME     NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notif_member (member_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- audit_log
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_id   INT UNSIGNED NULL,
  action     VARCHAR(60)  NOT NULL,
  entity     VARCHAR(40)  NOT NULL,
  entity_id  BIGINT       NULL,
  diff_json  JSON         NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_actor (actor_id),
  KEY idx_audit_entity (entity, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ─────────────────────────────────────────────────────────────
-- seed: roles
-- ─────────────────────────────────────────────────────────────
INSERT INTO roles (code, label, color, can_edit_club_data, can_manage_members, can_manage_finance, rank_order) VALUES
  ('PRESIDENT',          'President',          '#8B1A3B', 1, 1, 1, 10),
  ('SECRETARY',          'Secretary',          '#003F87', 1, 1, 0, 20),
  ('TREASURER',          'Treasurer',          '#1F5F3F', 1, 0, 1, 30),
  ('VP1',                '1st Vice President', '#003F87', 0, 0, 0, 40),
  ('VP2',                '2nd Vice President', '#003F87', 0, 0, 0, 50),
  ('MEMBERSHIP_CHAIR',   'Membership Chair',   '#6B7785', 0, 0, 0, 60),
  ('SERVICE_CHAIR',      'Service Chair',      '#6B7785', 0, 0, 0, 70),
  ('TAIL_TWISTER',       'Tail Twister',       '#6B7785', 0, 0, 0, 80),
  ('MEMBER',             'Member',             '#6B7785', 0, 0, 0, 100)
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- seed: default club
INSERT INTO clubs (id, name, district, charter_year) VALUES
  (1, 'Lions Club of Ahmedabad host (Main)', '3232 B1', 2009)
ON DUPLICATE KEY UPDATE name = VALUES(name), district = VALUES(district);

-- seed: causes (from data.jsx CAUSES)
INSERT INTO causes (id, name, icon, units, unit_label, color, sort_order) VALUES
  ('vision',      'Vision',            '👁', '3420',  'screenings this year', '#003F87', 10),
  ('hunger',      'Hunger Relief',     '🍱', '12800', 'meals served',         '#C8362D', 20),
  ('environment', 'Environment',       '🌳', '1180',  'trees planted',        '#1F8A5B', 30),
  ('diabetes',    'Diabetes',          '💉', '640',   'tests sponsored',      '#7A3FB8', 40),
  ('cancer',      'Pediatric Cancer',  '🎗', '420000','raised (INR)',         '#E08E1A', 50),
  ('education',   'Education',         '📚', '420',   'kits distributed',     '#2A6FDB', 60)
ON DUPLICATE KEY UPDATE name = VALUES(name);
