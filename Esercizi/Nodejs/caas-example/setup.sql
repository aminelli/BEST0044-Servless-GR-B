-- Database Setup Script for Customer Management WebApp

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS customers_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE customers_db;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    company VARCHAR(150),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Italia',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_last_name (last_name),
    INDEX idx_company (company),
    INDEX idx_city (city),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
INSERT INTO customers (first_name, last_name, email, phone, company, address, city, state, postal_code, country, notes) VALUES
    ('Mario', 'Rossi', 'mario.rossi@example.com', '+39 333 1234567', 'Rossi SRL', 'Via Roma 123', 'Milano', 'MI', '20100', 'Italia', 'Cliente storico'),
    ('Laura', 'Bianchi', 'laura.bianchi@example.com', '+39 333 2345678', 'Bianchi & Co', 'Via Dante 45', 'Roma', 'RM', '00100', 'Italia', NULL),
    ('Giuseppe', 'Verdi', 'giuseppe.verdi@example.com', '+39 333 3456789', NULL, 'Corso Vittorio 78', 'Napoli', 'NA', '80100', 'Italia', 'Potenziale cliente VIP'),
    ('Anna', 'Neri', 'anna.neri@example.com', '+39 333 4567890', 'Neri Tech', 'Via Garibaldi 12', 'Torino', 'TO', '10100', 'Italia', NULL),
    ('Francesco', 'Gialli', 'francesco.gialli@example.com', '+39 333 5678901', 'Gialli Solutions', 'Via Manzoni 56', 'Firenze', 'FI', '50100', 'Italia', 'Contratto annuale attivo');

-- Create user for application (optional, for non-root access)
-- CREATE USER IF NOT EXISTS 'webapp_user'@'%' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON customers_db.* TO 'webapp_user'@'%';
-- FLUSH PRIVILEGES;

SELECT 'Database setup completed successfully!' AS status;
