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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entities/User");
const hostinger_config_1 = require("../config/hostinger.config");
const dotenv = __importStar(require("dotenv"));
// Cargar variables de entorno
dotenv.config();
const userRepository = hostinger_config_1.AppDataSource.getRepository(User_1.User);
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
const authMiddleware = async (req, res, next) => {
    try {
        console.log(`Verificando autenticación para ruta: ${req.method} ${req.originalUrl}`);
        console.log('Secret key utilizada:', jwtSecret);
        // Obtener el token del header de autorización
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('No se encontró encabezado de autorización');
            return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
        }
        if (!authHeader.startsWith('Bearer ')) {
            console.log('Formato de encabezado de autorización incorrecto');
            return res.status(401).json({ message: 'Formato de token incorrecto' });
        }
        const token = authHeader.split(' ')[1];
        console.log('Token extraído del encabezado de autorización:', token.substring(0, 20) + '...');
        // Verificar el token
        try {
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            console.log(`Token verificado para usuario: ${decoded.userId}`);
            // Verificar si el usuario todavía existe y está activo
            if (decoded.userId) {
                const user = await userRepository.findOneBy({ id: decoded.userId });
                if (!user) {
                    console.log(`Usuario con ID ${decoded.userId} no encontrado en la base de datos`);
                    return res.status(401).json({ message: 'Usuario no encontrado' });
                }
                if (!user.isActive) {
                    console.log(`Usuario con ID ${decoded.userId} está desactivado`);
                    return res.status(401).json({ message: 'Usuario desactivado' });
                }
                console.log(`Usuario ${decoded.userId} con rol ${decoded.role} autenticado correctamente`);
            }
            // Añadir información del usuario a la request
            req.user = decoded;
            next();
        }
        catch (jwtError) {
            // Manejar errores específicos de JWT
            if (jwtError instanceof Error) {
                if (jwtError.name === 'TokenExpiredError') {
                    console.log('Token expirado');
                    return res.status(401).json({ message: 'Token expirado', code: 'token_expired' });
                }
                else if (jwtError.name === 'JsonWebTokenError') {
                    console.log(`Error de verificación JWT: ${jwtError.message}`);
                    return res.status(401).json({ message: 'Token inválido', code: 'invalid_token' });
                }
            }
            console.error('Error no especificado en la verificación del token:', jwtError);
            return res.status(401).json({ message: 'Error en la autenticación' });
        }
    }
    catch (error) {
        console.error('Error general en middleware de autenticación:', error);
        if (error instanceof Error) {
            console.error('Mensaje de error:', error.message);
        }
        return res.status(500).json({ message: 'Error en la autenticación', error: error instanceof Error ? error.message : 'Error desconocido' });
    }
};
exports.authMiddleware = authMiddleware;
