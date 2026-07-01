-- E-GAINS networking fields on members (Expertise, Goals, Accomplishments, Interests, Network, Social)
SET NAMES utf8mb4;
ALTER TABLE members ADD COLUMN expertise      TEXT NULL;
ALTER TABLE members ADD COLUMN goals         TEXT NULL;
ALTER TABLE members ADD COLUMN accomplishments TEXT NULL;
ALTER TABLE members ADD COLUMN interests     TEXT NULL;
ALTER TABLE members ADD COLUMN network       TEXT NULL;
ALTER TABLE members ADD COLUMN social        TEXT NULL;