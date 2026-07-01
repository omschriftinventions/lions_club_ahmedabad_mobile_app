-- Password authentication + auth-method setting
ALTER TABLE members ADD COLUMN password_hash VARCHAR(255) NULL;
INSERT INTO app_settings (k, value) VALUES ('auth_method','password') ON DUPLICATE KEY UPDATE value=value;