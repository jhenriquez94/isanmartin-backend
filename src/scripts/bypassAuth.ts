import { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import { User, UserRole } from '../entities/User';
import { AppDataSource } from '../config/database';

// Extender la interfaz Request para incluir el objeto user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Puerto para el servidor de prueba
const PORT = 4001;

// Crear un mock del middleware de autenticación que siempre autentifica como admin
const mockAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Usando middleware de autenticación de bypass');
  
  // Obtener usuario admin de la base de datos
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  
  const userRepository = AppDataSource.getRepository(User);
  const adminUser = await userRepository.findOne({
    where: { role: UserRole.ADMIN }
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
const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      select: ['id', 'name', 'email', 'role', 'phone', 'isActive', 'createdAt']
    });
    
    console.log(`Encontrados ${users.length} usuarios`);
    return res.json(users);
  } catch (error) {
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
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Conexión a la base de datos establecida');
    }
    
    // Configurar el servidor Express
    const app = express();
    app.use(cors());
    app.use(express.json());
    
    // Ruta de prueba para obtener usuarios (con bypass de autenticación)
    app.get('/api/users', mockAuthMiddleware, getAllUsers);
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor de prueba corriendo en http://localhost:${PORT}`);
      console.log(`Prueba obtener usuarios: curl http://localhost:${PORT}/api/users`);
    });
    
  } catch (error) {
    console.error('Error al iniciar servidor de prueba:', error);
  }
}

// Ejecutar el servidor
startBypassAuthServer(); 