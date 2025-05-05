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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
// Cargar variables de entorno
dotenv.config();
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
/**
 * Script para generar un token JWT para un usuario
 */
async function generateToken() {
    try {
        console.log('Iniciando generación de token JWT...');
        console.log('Secret key:', jwtSecret);
        // 1. Inicializar la conexión a la base de datos
        console.log('Inicializando conexión a la base de datos...');
        if (!database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.initialize();
            console.log('✅ Conexión a la base de datos establecida correctamente');
        }
        else {
            console.log('✅ La conexión a la base de datos ya está inicializada');
        }
        // 2. Buscar un usuario administrador
        console.log('\nBuscando usuario administrador...');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const adminUser = await userRepository.findOne({
            where: { role: User_1.UserRole.ADMIN }
        });
        if (!adminUser) {
            console.log('❌ No se encontró ningún usuario administrador');
            return;
        }
        console.log(`✅ Usuario administrador encontrado: ${adminUser.email}`);
        // 3. Generar un token JWT para el usuario
        console.log('\nGenerando token JWT...');
        const token = jsonwebtoken_1.default.sign({
            userId: adminUser.id,
            email: adminUser.email,
            role: adminUser.role
        }, jwtSecret, { expiresIn: '24h' });
        console.log(`✅ Token JWT generado correctamente para ${adminUser.email}`);
        console.log('\nToken para usar en pruebas:');
        console.log(token);
        console.log('\nPara probar la API, usa el siguiente comando curl:');
        console.log(`curl -X GET http://localhost:4000/api/users -H "Authorization: Bearer ${token}"`);
    }
    catch (error) {
        console.error('❌ Error al generar token:', error);
    }
    finally {
        // Cerrar la conexión a la base de datos
        if (database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.destroy();
            console.log('\nConexión a la base de datos cerrada');
        }
    }
}
// Ejecutar la función
generateToken();
