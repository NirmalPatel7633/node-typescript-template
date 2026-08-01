CREATE TABLE users (
    user_id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(60),
    email VARCHAR(30),
    password VARCHAR(60),
    access_token TEXT,
    refresh_token TEXT,
    created_at DATETIME,
    updated_at DATETIME

    INDEX idx_user_id (user_id),
    INDEX idx_email (email)
);