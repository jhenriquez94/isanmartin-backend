import { DataSource } from 'typeorm';
import { Property } from '../entities/Property';
import { User } from '../entities/User';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Depuración - mostrar todas las variables de entorno disponibles
console.log('Variables de entorno disponibles:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '******' : 'no definida');
console.log('DB_NAME:', process.env.DB_NAME);

// Configuración de la base de datos
console.log('Configuración de la base de datos:', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ? '******' : 'no definida',
    database: process.env.DB_NAME || 'isanmartin'
});

// Forzar el uso de la IP de Hostinger si estamos en producción
const dbHost = process.env.NODE_ENV === 'production' ? '193.203.175.234' : (process.env.DB_HOST || 'localhost');
console.log('Host de base de datos que se usará:', dbHost);

export const AppDataSource = new DataSource({
    type: "mysql",
    host: dbHost,
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