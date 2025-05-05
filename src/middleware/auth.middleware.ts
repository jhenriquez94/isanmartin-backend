import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppDataSource } from '../config/hostinger.config';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const userRepository = AppDataSource.getRepository(User);
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

// Extender la interfaz Request para incluir el objeto user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
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
            const decoded = jwt.verify(token, jwtSecret) as any;
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
        } catch (jwtError) {
            // Manejar errores específicos de JWT
            if (jwtError instanceof Error) {
                if (jwtError.name === 'TokenExpiredError') {
                    console.log('Token expirado');
                    return res.status(401).json({ message: 'Token expirado', code: 'token_expired' });
                } else if (jwtError.name === 'JsonWebTokenError') {
                    console.log(`Error de verificación JWT: ${jwtError.message}`);
                    return res.status(401).json({ message: 'Token inválido', code: 'invalid_token' });
                }
            }
            
            console.error('Error no especificado en la verificación del token:', jwtError);
            return res.status(401).json({ message: 'Error en la autenticación' });
        }
    } catch (error) {
        console.error('Error general en middleware de autenticación:', error);
        if (error instanceof Error) {
            console.error('Mensaje de error:', error.message);
        }
        return res.status(500).json({ message: 'Error en la autenticación', error: error instanceof Error ? error.message : 'Error desconocido' });
    }
}; 