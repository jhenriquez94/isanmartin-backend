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
exports.logDatabaseConfig = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const Property_1 = require("../entities/Property");
const User_1 = require("../entities/User");
const dotenv = __importStar(require("dotenv"));
// Cargar variables de entorno
dotenv.config();
// Determinar si estamos en el entorno de producción
const isProduction = process.env.NODE_ENV === 'production';
// Configuración para el entorno de producción (Hostinger)
const productionConfig = {
    type: "mysql",
    host: process.env.HOSTINGER_DB_HOST,
    port: process.env.HOSTINGER_DB_PORT ? parseInt(process.env.HOSTINGER_DB_PORT) : 3306,
    username: process.env.HOSTINGER_DB_USER,
    password: process.env.HOSTINGER_DB_PASSWORD,
    database: process.env.HOSTINGER_DB_NAME,
    synchronize: false, // En producción debe ser false para evitar cambios accidentales
    logging: false,
    entities: [Property_1.Property, User_1.User],
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
    type: "mysql",
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'isanmartin',
    synchronize: true,
    logging: true,
    entities: [Property_1.Property, User_1.User],
    subscribers: [],
    migrations: [],
    charset: 'utf8mb4_general_ci',
    extra: {
        connectionLimit: 10
    },
    driver: require('mysql2')
};
// Usar la configuración adecuada según el entorno
exports.AppDataSource = new typeorm_1.DataSource(isProduction ? productionConfig : devConfig);
// Función para mostrar información sobre la conexión actual
const logDatabaseConfig = () => {
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
exports.logDatabaseConfig = logDatabaseConfig;
