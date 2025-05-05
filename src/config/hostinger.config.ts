import { DataSource } from 'typeorm';
import { Property } from '../entities/Property';
import { User } from '../entities/User';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Determinar si estamos en el entorno de producción
const isProduction = process.env.NODE_ENV === 'production';

// Configuración para el entorno de producción (Hostinger)
const productionConfig = {
    type: "mysql" as const,
    host: process.env.HOSTINGER_DB_HOST,
    port: process.env.HOSTINGER_DB_PORT ? parseInt(process.env.HOSTINGER_DB_PORT) : 3306,
    username: process.env.HOSTINGER_DB_USER,
    password: process.env.HOSTINGER_DB_PASSWORD,
    database: process.env.HOSTINGER_DB_NAME,
    synchronize: false, // En producción debe ser false para evitar cambios accidentales
    logging: false,
    entities: [Property, User],
    subscribers: [],
    migrations: [],
    charset: 'utf8mb4_general_ci',
    extra: {
        connectionLimit: 5
    },
    driver: require('mysql2')
};

// Configuración para el entorno de desarrollo (local o Docker)
const devConfig = {
    type: "mysql" as const,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'isanmartin',
    synchronize: true,
    logging: true,
    entities: [Property, User],
    subscribers: [],
    migrations: [],
    charset: 'utf8mb4_general_ci',
    extra: {
        connectionLimit: 10
    },
    driver: require('mysql2')
};

// Usar la configuración adecuada según el entorno
export const AppDataSource = new DataSource(isProduction ? productionConfig : devConfig);

// Función para mostrar información sobre la conexión actual
export const logDatabaseConfig = () => {
    console.log(`Base de datos conectada en modo: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
    console.log('Configuración:', isProduction ? {
        host: process.env.HOSTINGER_DB_HOST,
        database: process.env.HOSTINGER_DB_NAME,
        user: process.env.HOSTINGER_DB_USER,
        port: process.env.HOSTINGER_DB_PORT || 3306
    } : {
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'isanmartin',
        user: process.env.DB_USER || 'root',
        port: process.env.DB_PORT || 3306
    });
}; 