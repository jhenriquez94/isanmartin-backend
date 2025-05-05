import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Script para generar un token JWT para un usuario
 */
async function generateToken() {
  try {
    console.log('Iniciando generación de token JWT...');
    console.log('Secret key:', jwtSecret);
    
    // 1. Inicializar la conexión a la base de datos
    console.log('Inicializando conexión a la base de datos...');
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexión a la base de datos establecida correctamente');
    } else {
      console.log('✅ La conexión a la base de datos ya está inicializada');
    }

    // 2. Buscar un usuario administrador
    console.log('\nBuscando usuario administrador...');
    const userRepository = AppDataSource.getRepository(User);
    const adminUser = await userRepository.findOne({
      where: { role: UserRole.ADMIN }
    });

    if (!adminUser) {
      console.log('❌ No se encontró ningún usuario administrador');
      return;
    }

    console.log(`✅ Usuario administrador encontrado: ${adminUser.email}`);

    // 3. Generar un token JWT para el usuario
    console.log('\nGenerando token JWT...');
    const token = jwt.sign(
      { 
        userId: adminUser.id, 
        email: adminUser.email, 
        role: adminUser.role 
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    console.log(`✅ Token JWT generado correctamente para ${adminUser.email}`);
    console.log('\nToken para usar en pruebas:');
    console.log(token);
    
    console.log('\nPara probar la API, usa el siguiente comando curl:');
    console.log(`curl -X GET http://localhost:4000/api/users -H "Authorization: Bearer ${token}"`);

  } catch (error) {
    console.error('❌ Error al generar token:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\nConexión a la base de datos cerrada');
    }
  }
}

// Ejecutar la función
generateToken(); 