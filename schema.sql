-- Schema do banco de dados Anota Ganhos Girls
-- Execute este script no seu banco MySQL antes de iniciar a aplicação

CREATE DATABASE IF NOT EXISTS anota_ganhos_girls CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE anota_ganhos_girls;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  passwordHash VARCHAR(255),
  name TEXT,
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de anotações de ganhos
CREATE TABLE IF NOT EXISTS earnings (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) NOT NULL,
  gbpAmount INT DEFAULT 0,
  eurAmount INT DEFAULT 0,
  usdAmount INT DEFAULT 0,
  durationMinutes INT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  paymentMethod VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de estatísticas semanais
CREATE TABLE IF NOT EXISTS weeklyStats (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) NOT NULL,
  weekStartDate DATE NOT NULL,
  totalGbpAmount INT DEFAULT 0,
  totalEurAmount INT DEFAULT 0,
  totalUsdAmount INT DEFAULT 0,
  totalDurationMinutes INT DEFAULT 0,
  totalEarnings INT DEFAULT 0,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_week (userId, weekStartDate),
  INDEX idx_userId (userId),
  INDEX idx_weekStartDate (weekStartDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de períodos de top
CREATE TABLE IF NOT EXISTS topPeriods (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) NOT NULL,
  startDate DATETIME NOT NULL,
  endDate DATETIME NOT NULL,
  currentDay INT DEFAULT 1,
  totalGbpAmount INT DEFAULT 0,
  totalEurAmount INT DEFAULT 0,
  totalUsdAmount INT DEFAULT 0,
  totalDurationMinutes INT DEFAULT 0,
  status ENUM('active', 'stopped', 'completed') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_startDate (startDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir usuário admin padrão (senha: Admin123!)
INSERT INTO users (id, email, name, passwordHash, role) 
VALUES (
  'admin_default',
  'admin@anotaganhos.com',
  'Admin',
  '$2a$10$YourHashedPasswordHere',
  'admin'
) ON DUPLICATE KEY UPDATE role = 'admin';

-- Nota: A senha será criada automaticamente pelo servidor na primeira inicialização
-- Credenciais padrão: admin@anotaganhos.com / Admin123!

