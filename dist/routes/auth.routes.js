"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const hostinger_config_1 = require("../config/hostinger.config");
const router = (0, express_1.Router)();
// Ruta de diagnóstico para la base de datos
router.get('/diagnostico-db', async (_req, res) => {
    try {
        // Verificar si la conexión está inicializada
        if (!hostinger_config_1.AppDataSource.isInitialized) {
            return res.status(500).json({
                error: true,
                message: 'La conexión a la base de datos no está inicializada'
            });
        }
        // Consultar información de las tablas
        const tablas = await hostinger_config_1.AppDataSource.query('SHOW TABLES');
        // Verificar estructura de tablas principales
        let estructuraUsuarios = null;
        let estructuraPropiedades = null;
        try {
            estructuraUsuarios = await hostinger_config_1.AppDataSource.query('DESCRIBE user');
        }
        catch (error) {
            console.error('Error al consultar estructura de usuarios:', error);
        }
        try {
            estructuraPropiedades = await hostinger_config_1.AppDataSource.query('DESCRIBE property');
        }
        catch (error) {
            console.error('Error al consultar estructura de propiedades:', error);
        }
        return res.json({
            success: true,
            isConnected: hostinger_config_1.AppDataSource.isInitialized,
            dbOptions: {
                type: hostinger_config_1.AppDataSource.options.type,
                database: hostinger_config_1.AppDataSource.options.database
            },
            tables: tablas,
            userTableStructure: estructuraUsuarios,
            propertyTableStructure: estructuraPropiedades
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                error: true,
                message: 'Error al verificar la base de datos',
                details: error.message
            });
        }
        return res.status(500).json({
            error: true,
            message: 'Error desconocido al verificar la base de datos'
        });
    }
});
// Rutas públicas
router.post('/register', auth_controller_1.AuthController.register);
router.post('/login', auth_controller_1.AuthController.login);
// Rutas protegidas
router.get('/profile', auth_middleware_1.authMiddleware, auth_controller_1.AuthController.profile);
exports.default = router;
