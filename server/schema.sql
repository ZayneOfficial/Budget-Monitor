CREATE DATABASE IF NOT EXISTS budget_monitor
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE budget_monitor;

CREATE TABLE IF NOT EXISTS transactions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_transactions_date (transaction_date),
    INDEX idx_transactions_category (category)
);