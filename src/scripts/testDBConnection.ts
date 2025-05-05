import { AppDataSource } from '../config/database';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para probar la conexión a la base de datos
 * Ejecutar: npx ts-node src/scripts/testDBConnection.ts
 */
async function testConnection() {
    console.log('Iniciando prueba de conexión a la base de datos...');
    console.log('Configuración de conexión:', {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        username: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'isanmartin'
    });

    try {
        // Inicializar la conexión a la base de datos
        const dataSource = await AppDataSource.initialize();
        console.log('¡Conexión exitosa!');

        // Verificar tablas existentes
        console.log('Verificando tablas existentes...');
        
        // Consultar tabla de usuarios
        try {
            const userCount = await dataSource.manager.query('SELECT COUNT(*) as count FROM user');
            console.log(`- Tabla 'user': ${userCount[0].count} usuarios encontrados`);
        } catch (error) {
            console.error(`- Tabla 'user': ERROR - No se puede acceder a la tabla`);
            console.error(error);
        }

        // Consultar tabla de propiedades
        try {
            const propertyCount = await dataSource.manager.query('SELECT COUNT(*) as count FROM property');
            console.log(`- Tabla 'property': ${propertyCount[0].count} propiedades encontradas`);
        } catch (error) {
            console.error(`- Tabla 'property': ERROR - No se puede acceder a la tabla`);
            console.error(error);
        }

        // Cerrar la conexión
        await dataSource.destroy();
        console.log('Conexión cerrada');
    } catch (error) {
        console.error('¡ERROR DE CONEXIÓN!');
        console.error(error);
        process.exit(1);
    }
}

// Ejecutar la prueba
testConnection()
    .then(() => {
        console.log('Prueba completada');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error en la ejecución de la prueba:', error);
        process.exit(1);
    }); 