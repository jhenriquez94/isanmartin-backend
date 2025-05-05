"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const User_1 = require("../entities/User");
const database_1 = require("../config/database");
// Puerto para el servidor de prueba
const PORT = 4001;
// Crear un mock del middleware de autenticación que siempre autentifica como admin
const mockAuthMiddleware = async (req, res, next) => {
    console.log('Usando middleware de autenticación de bypass');
    // Obtener usuario admin de la base de datos
    if (!database_1.AppDataSource.isInitialized) {
        await database_1.AppDataSource.initialize();
    }
    const userRepository = database_1.AppDataSource.getRepository(User_1.User);
    const adminUser = await userRepository.findOne({
        where: { role: User_1.UserRole.ADMIN }
    });
    if (!adminUser) {
        return res.status(500).json({ message: 'No se encontró usuario administrador' });
    }
    // Asignar información de usuario al request
    req.user = {
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
    };
    console.log(`Autenticando como admin: ${adminUser.email}`);
    next();
};
// Función para simular la respuesta de getAllUsers
const getAllUsers = async (req, res) => {
    try {
        if (!database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.initialize();
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const users = await userRepository.find({
            select: ['id', 'name', 'email', 'role', 'phone', 'isActive', 'createdAt']
        });
        console.log(`Encontrados ${users.length} usuarios`);
        return res.json(users);
    }
    catch (error) {
        console.error('Error al obtener usuarios:', error);
        return res.status(500).json({
            message: 'Error al obtener usuarios',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
async function startBypassAuthServer() {
    try {
        console.log('Iniciando servidor de prueba con bypass de autenticación...');
        // Inicializar la base de datos
        if (!database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.initialize();
            console.log('Conexión a la base de datos establecida');
        }
        // Configurar el servidor Express
        const app = (0, express_1.default)();
        app.use((0, cors_1.default)());
        app.use(express_1.default.json());
        // Ruta de prueba para obtener usuarios (con bypass de autenticación)
        app.get('/api/users', mockAuthMiddleware, getAllUsers);
        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`Servidor de prueba corriendo en http://localhost:${PORT}`);
            console.log(`Prueba obtener usuarios: curl http://localhost:${PORT}/api/users`);
        });
    }
    catch (error) {
        console.error('Error al iniciar servidor de prueba:', error);
    }
}
// Ejecutar el servidor
startBypassAuthServer();
