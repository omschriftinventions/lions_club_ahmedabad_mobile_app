-- Admin-configurable app settings (key/value). Used for the OTP provider toggle.
CREATE TABLE IF NOT EXISTS app_settings (
  k          VARCHAR(60) NOT NULL,
  value      TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (k)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO app_settings (k, value) VALUES ('otp_provider','whatsapp') ON DUPLICATE KEY UPDATE value=value;