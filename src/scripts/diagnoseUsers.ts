import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import jwt from 'jsonwebtoken';

/**
 * Script para diagnosticar problemas con el servicio de usuarios
 */
async function diagnoseUsers() {
  try {
    console.log('Iniciando diagnóstico del servicio de usuarios...');
    
    // 1. Inicializar la conexión a la base de datos
    console.log('Inicializando conexión a la base de datos...');
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexión a la base de datos establecida correctamente');
    } else {
      console.log('✅ La conexión a la base de datos ya está inicializada');
    }

    // 2. Verificar acceso a la tabla de usuarios
    console.log('\nVerificando acceso a la tabla de usuarios...');
    const userRepository = AppDataSource.getRepository(User);
    try {
      const userCount = await userRepository.count();
      console.log(`✅ Tabla de usuarios accesible. Total de usuarios: ${userCount}`);

      // 3. Mostrar información básica de los usuarios
      console.log('\nLista de usuarios en la base de datos:');
      const users = await userRepository.find({
        select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt']
      });

      if (users.length === 0) {
        console.log('❌ No hay usuarios en la base de datos');
      } else {
        console.table(users.map(user => ({
          ID: user.id.substring(0, 8) + '...',
          Nombre: user.name,
          Email: user.email,
          Rol: user.role,
          Activo: user.isActive ? 'Sí' : 'No',
          Creado: new Date(user.createdAt).toLocaleDateString()
        })));
      }

      // 4. Generar un token de prueba para un usuario administrador
      console.log('\nGenerando token de prueba para un usuario administrador...');
      const adminUser = await userRepository.findOne({
        where: { role: UserRole.ADMIN }
      });

      if (adminUser) {
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const token = jwt.sign(
          { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
          jwtSecret,
          { expiresIn: '24h' }
        );
        
        console.log(`✅ Token JWT generado correctamente para ${adminUser.email}`);
        console.log(`Token: ${token}`);
        console.log('\nPara probar la API, usa el siguiente comando curl:');
        console.log(`curl -X GET http://localhost:4000/api/users -H "Authorization: Bearer ${token}"`);
      } else {
        console.log('❌ No se encontró ningún usuario administrador');
      }

    } catch (dbError) {
      console.error('❌ Error al acceder a la tabla de usuarios:', dbError);
    }

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\nConexión a la base de datos cerrada');
    }
  }
}

// Ejecutar el diagnóstico
diagnoseUsers(); 