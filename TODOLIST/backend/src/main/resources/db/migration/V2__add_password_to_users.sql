ALTER TABLE users ADD COLUMN password VARCHAR(128) NULL COMMENT 'BCrypt加密密码' AFTER avatar_url;
