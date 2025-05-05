import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource, logDatabaseConfig } from './config/hostinger.config';
import propertyRoutes from './routes/property.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import ufRoutes from './routes/uf.routes';
import mortgageRoutes from './routes/mortgage.routes';
import { UFSchedulerService } from './services/ufScheduler.service';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
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

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  credentials: true
}));
app.use(express.json());

// Inicializar la conexión a la base de datos
AppDataSource.initialize()
    .then(() => {
        console.log('Conexión a la base de datos establecida');
        logDatabaseConfig();
        
        // Inicializar el programador de tareas para la UF
        UFSchedulerService.initialize();
    })
    .catch((error) => {
        console.error('Error al conectar con la base de datos:', error);
    });

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/uf', ufRoutes);
app.use('/api/mortgage', mortgageRoutes);

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
        UFSchedulerService.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('Cerrando servidor por señal SIGTERM...');
        UFSchedulerService.stop();
        process.exit(0);
    });
}); 