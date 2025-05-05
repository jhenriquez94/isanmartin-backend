import bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/User';
import { AppDataSource } from '../config/database';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function createAdminUser() {
  try {
    // Inicializar la conexión a la base de datos
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Conexión a la base de datos establecida');
    }

    // Datos del usuario administrador
    const adminUser = {
      name: 'Administrador',
      email: 'admin@isanmartin.cl',
      password: 'admin123',
      role: UserRole.ADMIN,
      phone: '+56912345678',
      isActive: true
    };

    // Verificar si el usuario ya existe
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email: adminUser.email } });

    if (existingUser) {
      console.log('El usuario administrador ya existe');
      await AppDataSource.destroy();
      return;
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);

    // Crear el usuario
    const user = userRepository.create({
      ...adminUser,
      password: hashedPassword
    });

    // Guardar el usuario en la base de datos
    await userRepository.save(user);
    console.log('Usuario administrador creado exitosamente');
    console.log('Email:', adminUser.email);
    console.log('Contraseña (sin encriptar):', adminUser.password);

    // Cerrar la conexión
    await AppDataSource.destroy();
    console.log('Conexión a la base de datos cerrada');
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
    
    // Cerrar la conexión si existe un error
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Ejecutar la función
createAdminUser(); 