"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const dotenv = __importStar(require("dotenv"));
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
        const dataSource = await database_1.AppDataSource.initialize();
        console.log('¡Conexión exitosa!');
        // Verificar tablas existentes
        console.log('Verificando tablas existentes...');
        // Consultar tabla de usuarios
        try {
            const userCount = await dataSource.manager.query('SELECT COUNT(*) as count FROM user');
            console.log(`- Tabla 'user': ${userCount[0].count} usuarios encontrados`);
        }
        catch (error) {
            console.error(`- Tabla 'user': ERROR - No se puede acceder a la tabla`);
            console.error(error);
        }
        // Consultar tabla de propiedades
        try {
            const propertyCount = await dataSource.manager.query('SELECT COUNT(*) as count FROM property');
            console.log(`- Tabla 'property': ${propertyCount[0].count} propiedades encontradas`);
        }
        catch (error) {
            console.error(`- Tabla 'property': ERROR - No se puede acceder a la tabla`);
            console.error(error);
        }
        // Cerrar la conexión
        await dataSource.destroy();
        console.log('Conexión cerrada');
    }
    catch (error) {
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
