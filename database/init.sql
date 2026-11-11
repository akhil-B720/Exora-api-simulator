-- EXORA Database Initialization Script
-- Creates database, user and grants privileges

CREATE DATABASE IF NOT EXISTS exora_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'exora_user'@'%' IDENTIFIED BY 'exora_secure_pass';

GRANT ALL PRIVILEGES ON exora_db.* TO 'exora_user'@'%';

FLUSH PRIVILEGES;
