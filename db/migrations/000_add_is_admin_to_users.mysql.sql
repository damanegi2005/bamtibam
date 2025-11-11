-- MySQL migration: add is_admin column to users table
SET NAMES utf8mb4;

-- Add is_admin column if it doesn't exist
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_admin TINYINT(1) NOT NULL DEFAULT 0 AFTER role;

CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Update role based on is_admin for existing data
UPDATE users SET is_admin = 1 WHERE role = 'admin';
UPDATE users SET role = CASE WHEN is_admin = 1 THEN 'admin' ELSE 'customer' END;





