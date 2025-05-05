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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../entities/User");
const database_1 = require("../config/database");
const dotenv = __importStar(require("dotenv"));
// Cargar variables de entorno
dotenv.config();
async function createAdminUser() {
    try {
        // Inicializar la conexión a la base de datos
        if (!database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.initialize();
            console.log('Conexión a la base de datos establecida');
        }
        // Datos del usuario administrador
        const adminUser = {
            name: 'Administrador',
            email: 'admin@isanmartin.cl',
            password: 'admin123',
            role: User_1.UserRole.ADMIN,
            phone: '+56912345678',
            isActive: true
        };
        // Verificar si el usuario ya existe
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const existingUser = await userRepository.findOne({ where: { email: adminUser.email } });
        if (existingUser) {
            console.log('El usuario administrador ya existe');
            await database_1.AppDataSource.destroy();
            return;
        }
        // Encriptar la contraseña
        const hashedPassword = await bcryptjs_1.default.hash(adminUser.password, 10);
        // Crear el usuario
        const user = userRepository.create(Object.assign(Object.assign({}, adminUser), { password: hashedPassword }));
        // Guardar el usuario en la base de datos
        await userRepository.save(user);
        console.log('Usuario administrador creado exitosamente');
        console.log('Email:', adminUser.email);
        console.log('Contraseña (sin encriptar):', adminUser.password);
        // Cerrar la conexión
        await database_1.AppDataSource.destroy();
        console.log('Conexión a la base de datos cerrada');
    }
    catch (error) {
        console.error('Error al crear el usuario administrador:', error);
        // Cerrar la conexión si existe un error
        if (database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.destroy();
        }
    }
}
// Ejecutar la función
createAdminUser();
