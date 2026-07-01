-- Super admin flag on members (hidden from roster, bypasses RBAC)
ALTER TABLE members ADD COLUMN is_super_admin TINYINT(1) NOT NULL DEFAULT 0;
