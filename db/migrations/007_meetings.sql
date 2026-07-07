-- 007_meetings.sql AI Meeting Assistant module
-- Normalized tables for meetings, recordings, transcripts, summaries

-- Meeting root: one per recorded/uploaded session
CREATE TABLE IF NOT EXISTS meetings (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  club_id         INT NOT NULL,
  title           VARCHAR(255) NOT NULL,
  meeting_date    DATE NULL,
  location        VARCHAR(255) NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  status          ENUM('recording','uploaded','transcribing','transcribed','summarizing','summarized','failed') NOT NULL DEFAULT 'recording',
  meeting_type    VARCHAR(100) NULL,
  meeting_mood    VARCHAR(100) NULL,
  language        VARCHAR(20) NULL,
  notes           TEXT NULL,
  created_by      INT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_meeting_club   FOREIGN KEY (club_id)    REFERENCES clubs(id)   ON DELETE CASCADE,
  CONSTRAINT fk_meeting_creator FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_meetings_club_status ON meetings(club_id, status);
CREATE INDEX idx_meetings_date ON meetings(meeting_date);

-- Participants (members or guests)
CREATE TABLE IF NOT EXISTS meeting_participants (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  meeting_id  INT NOT NULL,
  member_id   INT NULL,
  name        VARCHAR(255) NOT NULL,
  role        VARCHAR(100) NULL,
  CONSTRAINT fk_part_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  CONSTRAINT fk_part_member  FOREIGN KEY (member_id)  REFERENCES members(id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_part_meeting ON meeting_participants(meeting_id);

-- Audio/video recording files
CREATE TABLE IF NOT EXISTS meeting_recordings (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  meeting_id        INT NOT NULL,
  file_path         VARCHAR(500) NOT NULL,
  mime_type         VARCHAR(100) NOT NULL DEFAULT 'audio/m4a',
  duration_seconds  INT NOT NULL DEFAULT 0,
  file_size         INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rec_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_rec_meeting ON meeting_recordings(meeting_id);

-- Full transcript for a meeting
CREATE TABLE IF NOT EXISTS meeting_transcripts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  meeting_id  INT NOT NULL,
  language    VARCHAR(20) NULL,
  full_text   MEDIUMTEXT NOT NULL,
  word_count  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_trans_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_trans_meeting ON meeting_transcripts(meeting_id);

-- Chunked transcript segments (timestamped, future speaker detection)
CREATE TABLE IF NOT EXISTS meeting_transcript_chunks (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  transcript_id INT NOT NULL,
  meeting_id    INT NOT NULL,
  seq           INT NOT NULL,
  text          TEXT NOT NULL,
  start_ms      INT NULL,
  end_ms        INT NULL,
  speaker       VARCHAR(50) NULL,
  CONSTRAINT fk_chunk_trans   FOREIGN KEY (transcript_id) REFERENCES meeting_transcripts(id) ON DELETE CASCADE,
  CONSTRAINT fk_chunk_meeting  FOREIGN KEY (meeting_id)   REFERENCES meetings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_chunk_trans ON meeting_transcript_chunks(transcript_id, seq);
CREATE INDEX idx_chunk_meeting ON meeting_transcript_chunks(meeting_id);

-- AI-generated structured summary
CREATE TABLE IF NOT EXISTS meeting_summaries (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  meeting_id          INT NOT NULL,
  executive_summary   TEXT NULL,
  key_discussions     JSON NULL,
  action_items        JSON NULL,
  decisions           JSON NULL,
  follow_ups          JSON NULL,
  risks               JSON NULL,
  topics              JSON NULL,
  next_meeting        JSON NULL,
  meeting_mood        VARCHAR(100) NULL,
  meeting_type        VARCHAR(100) NULL,
  model_used          VARCHAR(100) NULL,
  prompt_tokens       INT NULL,
  completion_tokens   INT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sum_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sum_meeting ON meeting_summaries(meeting_id);

-- Normalized action items (queryable, status-trackable)
CREATE TABLE IF NOT EXISTS meeting_action_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  meeting_id  INT NOT NULL,
  description TEXT NOT NULL,
  assignee    VARCHAR(255) NULL,
  due_date    DATE NULL,
  status      ENUM('open','in_progress','done','deferred') NOT NULL DEFAULT 'open',
  CONSTRAINT fk_ai_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_ai_meeting ON meeting_action_items(meeting_id, status);

-- Normalized decisions
CREATE TABLE IF NOT EXISTS meeting_decisions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  meeting_id  INT NOT NULL,
  description TEXT NOT NULL,
  decided_by  VARCHAR(255) NULL,
  CONSTRAINT fk_dec_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_dec_meeting ON meeting_decisions(meeting_id);

-- Normalized follow-ups
CREATE TABLE IF NOT EXISTS meeting_follow_ups (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  meeting_id  INT NOT NULL,
  description TEXT NOT NULL,
  owner       VARCHAR(255) NULL,
  due_date    DATE NULL,
  status      ENUM('open','in_progress','done') NOT NULL DEFAULT 'open',
  CONSTRAINT fk_fu_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_fu_meeting ON meeting_follow_ups(meeting_id, status);
