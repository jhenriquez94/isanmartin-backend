import { DataSource } from 'typeorm';
import { Property } from '../entities/Property';
import { User } from '../entities/User';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de la base de datos
console.log('Configuración de la base de datos:', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'isanmartin'
});

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'isanmartin',
    synchronize: true, // En desarrollo, en producción debe ser false
    logging: true,
    entities: [Property, User],
    subscribers: [],
    migrations: [],
    charset: 'utf8mb4_general_ci', // Collation para MySQL que es insensible a mayúsculas/minúsculas
    // Opciones específicas para MySQL
    extra: {
        connectionLimit: 10
    },
    driver: require('mysql2')
}); 