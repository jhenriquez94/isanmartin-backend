-- Script de inicialización de base de datos para ISanMartin
-- Este script crea la estructura de tablas y datos iniciales
-- Usar en hosting compartido donde la base de datos ya fue creada desde el panel de control

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS `user` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `phone` VARCHAR(50),
    `isActive` BOOLEAN DEFAULT TRUE,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Crear tabla de propiedades
CREATE TABLE IF NOT EXISTS `property` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `city` VARCHAR(255) NOT NULL,
    `region` VARCHAR(255) NOT NULL,
    `priceUF` DECIMAL(10,2) NOT NULL,
    `priceCLP` DECIMAL(15,2) NOT NULL,
    `mainPriceCurrency` VARCHAR(10) NOT NULL,
    `action` VARCHAR(20) NOT NULL,
    `bedrooms` INT NOT NULL,
    `bathrooms` INT NOT NULL,
    `surface` INT NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `images` TEXT NOT NULL,
    `isFeatured` BOOLEAN DEFAULT FALSE,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Crear usuario administrador inicial
-- Contraseña: admin123 (esto debe ser reemplazado por un hash seguro)
INSERT INTO `user` (id, name, email, password, role, phone, isActive)
VALUES (
    UUID(),
    'Administrador',
    'admin@isanmartin.cl',
    '$2b$10$HWnRXHbG1jY5.PbEDCqejeQgutQBpn9lU.PSbkG3lmGiIZr2mPPwa', -- Hash de 'admin123'
    'admin',
    '+56912345678',
    TRUE
) ON DUPLICATE KEY UPDATE id=id;

-- Insertar propiedades de ejemplo
INSERT INTO `property` (
    id, type, title, description, address, city, region, 
    priceUF, priceCLP, mainPriceCurrency, action, 
    bedrooms, bathrooms, surface, status, images, isFeatured
) VALUES (
    UUID(),
    'casa',
    'Casa en Lo Barnechea',
    'Hermosa casa en sector exclusivo con vista a la cordillera',
    'Av. El Rodeo 12700',
    'Lo Barnechea',
    'Metropolitana',
    8500.00,
    332361900.00,
    'uf',
    'venta',
    4,
    3,
    180,
    'disponible',
    'casa1.jpg,casa2.jpg,casa3.jpg',
    TRUE
) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `property` (
    id, type, title, description, address, city, region, 
    priceUF, priceCLP, mainPriceCurrency, action, 
    bedrooms, bathrooms, surface, status, images, isFeatured
) VALUES (
    UUID(),
    'departamento',
    'Departamento en Las Condes',
    'Moderno departamento con excelente conectividad',
    'Av. Apoquindo 6410',
    'Las Condes',
    'Metropolitana',
    5200.00,
    203327280.00,
    'uf',
    'venta',
    2,
    2,
    90,
    'disponible',
    'depto1.jpg,depto2.jpg',
    TRUE
) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `property` (
    id, type, title, description, address, city, region, 
    priceUF, priceCLP, mainPriceCurrency, action, 
    bedrooms, bathrooms, surface, status, images, isFeatured
) VALUES (
    UUID(),
    'casa',
    'Casa en Viña del Mar',
    'Amplia casa con jardín a pasos de la playa',
    'Av. Perú 760',
    'Viña del Mar',
    'Valparaíso',
    7800.00,
    304990920.00,
    'uf',
    'venta',
    5,
    4,
    220,
    'disponible',
    'vinacasa1.jpg,vinacasa2.jpg,vinacasa3.jpg',
    FALSE
) ON DUPLICATE KEY UPDATE id=id; 