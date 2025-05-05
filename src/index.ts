import 'reflect-metadata';
import * as express from 'express';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import userRoutes from './routes/user.routes';
import mortgageRoutes from './routes/mortgage.routes';
import ufRoutes from './routes/uf.routes';
import { UFSchedulerService } from './services/ufScheduler.service';

// Cargar variables de entorno
dotenv.config();

// Puerto en el que se ejecutará el servidor
const PORT = process.env.PORT || 4000;

// Crear la aplicación Express
const app = express();

// Configuración de CORS
const allowedOrigins: string[] = [];

// Añadir URLs de frontend configuradas
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

if (process.env.FRONTEND_PRODUCTION_URL) {
  allowedOrigins.push(process.env.FRONTEND_PRODUCTION_URL);
}

// Añadir URLs de desarrollo
allowedOrigins.push('http://localhost:3000', 'http://frontend:3000');

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como aplicaciones móviles)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Origen bloqueado por CORS: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

// Middleware para registrar solicitudes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mortgage', mortgageRoutes);
app.use('/api/uf', ufRoutes);

// Ruta para verificar si el servidor está funcionando
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Iniciar el servidor y la conexión a la base de datos
AppDataSource.initialize()
  .then(() => {
    console.log('Conexión a la base de datos establecida');
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
  });

export default app; 