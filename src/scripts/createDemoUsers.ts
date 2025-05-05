import bcryptjs from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';

/**
 * Genera un hash de contraseña usando bcryptjs
 * @param password Contraseña a hashear
 * @returns Hash de la contraseña
 */
function hashPassword(password: string): string {
  // Crear un salt
  const salt = bcryptjs.genSaltSync(10);
  
  // Crear hash con salt
  return bcryptjs.hashSync(password, salt);
}

/**
 * Genera usuarios de demostración para la base de datos
 */
async function createDemoUsers() {
  try {
    // Inicializar la conexión a la base de datos
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Conexión a la base de datos establecida');
    }

    // Verificar si ya hay usuarios en la base de datos
    const userCount = await AppDataSource.getRepository(User).count();
    
    console.log(`Actualmente hay ${userCount} usuarios en la base de datos.`);
    console.log('Se crearán los usuarios de demostración si no existen.');

    // Generar hashes de contraseñas
    const adminPasswordHash = hashPassword('admin123');
    const agentPasswordHash = hashPassword('agent123');
    const clientPasswordHash = hashPassword('client123');

    // Crear usuarios
    const usersToCreate = [
      {
        email: 'admin@isanmartin.cl',
        data: {
          name: 'Administrador',
          password: adminPasswordHash,
          role: UserRole.ADMIN,
          phone: '+56912345678',
          isActive: true
        }
      },
      {
        email: 'agente@isanmartin.cl',
        data: {
          name: 'Agente Inmobiliario',
          password: agentPasswordHash,
          role: UserRole.AGENT,
          phone: '+56987654321',
          isActive: true
        }
      },
      {
        email: 'cliente@ejemplo.com',
        data: {
          name: 'Cliente Demo',
          password: clientPasswordHash,
          role: UserRole.CLIENT,
          phone: '+56955556666',
          isActive: true
        }
      }
    ];

    const userRepository = AppDataSource.getRepository(User);
    let createdCount = 0;

    // Guardar usuarios en la base de datos
    for (const { email, data } of usersToCreate) {
      // Comprobar si el usuario ya existe
      const existingUser = await userRepository.findOne({ where: { email } });
      
      if (existingUser) {
        console.log(`Usuario ${email} ya existe, no se creará nuevamente.`);
        continue;
      }
      
      const user = new User();
      Object.assign(user, { email, ...data });
      
      await userRepository.save(user);
      console.log(`Usuario creado: ${user.name} (${user.email}) - Rol: ${user.role}`);
      createdCount++;
    }

    console.log(`Se han creado ${createdCount} usuarios de demostración`);
    
    // Cerrar la conexión a la base de datos
    await AppDataSource.destroy();
    console.log('Conexión a la base de datos cerrada');
  } catch (error) {
    console.error('Error al crear usuarios:', error);
    
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Conexión a la base de datos cerrada');
    }
    
    process.exit(1);
  }
}

// Ejecutar la función
createDemoUsers(); 