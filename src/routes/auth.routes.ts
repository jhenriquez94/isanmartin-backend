import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { AppDataSource } from '../config/hostinger.config';

const router = Router();

// Ruta de diagnóstico para la base de datos
router.get('/diagnostico-db', async (_req, res) => {
  try {
    // Verificar si la conexión está inicializada
    if (!AppDataSource.isInitialized) {
      return res.status(500).json({
        error: true,
        message: 'La conexión a la base de datos no está inicializada'
      });
    }
    
    // Consultar información de las tablas
    const tablas = await AppDataSource.query('SHOW TABLES');
    
    // Verificar estructura de tablas principales
    let estructuraUsuarios = null;
    let estructuraPropiedades = null;
    
    try {
      estructuraUsuarios = await AppDataSource.query('DESCRIBE user');
    } catch (error) {
      console.error('Error al consultar estructura de usuarios:', error);
    }
    
    try {
      estructuraPropiedades = await AppDataSource.query('DESCRIBE property');
    } catch (error) {
      console.error('Error al consultar estructura de propiedades:', error);
    }
    
    return res.json({
      success: true,
      isConnected: AppDataSource.isInitialized,
      dbOptions: {
        type: AppDataSource.options.type,
        database: AppDataSource.options.database
      },
      tables: tablas,
      userTableStructure: estructuraUsuarios,
      propertyTableStructure: estructuraPropiedades
    });
  } catch (error) {
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
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Rutas protegidas
router.get('/profile', authMiddleware, AuthController.profile);

export default router; 