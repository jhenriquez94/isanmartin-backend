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
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const hostinger_config_1 = require("./config/hostinger.config");
const property_routes_1 = __importDefault(require("./routes/property.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const uf_routes_1 = __importDefault(require("./routes/uf.routes"));
const mortgage_routes_1 = __importDefault(require("./routes/mortgage.routes"));
const ufScheduler_service_1 = require("./services/ufScheduler.service");
const dotenv = __importStar(require("dotenv"));
// Cargar variables de entorno
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';
// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});
// Configuración de CORS
const allowedOrigins = [];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.FRONTEND_PRODUCTION_URL) {
    allowedOrigins.push(process.env.FRONTEND_PRODUCTION_URL);
}
// Siempre permitir orígenes de desarrollo
if (!isProduction) {
    allowedOrigins.push('http://localhost:3000', 'http://frontend:3000');
}
app.use((0, cors_1.default)({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    credentials: true
}));
app.use(express_1.default.json());
// Inicializar la conexión a la base de datos
hostinger_config_1.AppDataSource.initialize()
    .then(() => {
    console.log('Conexión a la base de datos establecida');
    (0, hostinger_config_1.logDatabaseConfig)();
    // Inicializar el programador de tareas para la UF
    ufScheduler_service_1.UFSchedulerService.initialize();
})
    .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
});
// Rutas
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/properties', property_routes_1.default);
app.use('/api/uf', uf_routes_1.default);
app.use('/api/mortgage', mortgage_routes_1.default);
// Ruta de prueba
app.get('/', (_req, res) => {
    res.json({
        message: 'API de Isanmartin funcionando',
        environment: isProduction ? 'producción' : 'desarrollo',
        version: process.env.npm_package_version || '0.1.0'
    });
});
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en ${isProduction ? 'producción' : 'desarrollo'} en el puerto ${port}`);
    // Manejo de cierre limpio
    process.on('SIGINT', () => {
        console.log('Cerrando servidor...');
        ufScheduler_service_1.UFSchedulerService.stop();
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        console.log('Cerrando servidor por señal SIGTERM...');
        ufScheduler_service_1.UFSchedulerService.stop();
        process.exit(0);
    });
});
