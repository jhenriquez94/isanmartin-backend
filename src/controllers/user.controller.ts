import { Request, Response } from 'express';
import { AppDataSource } from '../config/hostinger.config';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcryptjs';

const userRepository = AppDataSource.getRepository(User);

export class UserController {
    // Obtener todos los usuarios (solo admin)
    static async getAllUsers(req: Request, res: Response): Promise<Response> {
        try {
            console.log('Solicitud para obtener todos los usuarios recibida');
            
            // Verificar autenticación del usuario
            if (!req.user) {
                console.log('Error: No hay información de usuario en la solicitud');
                return res.status(401).json({ message: 'No autenticado' });
            }
            
            if (req.user?.role !== UserRole.ADMIN) {
                console.log(`Error: Usuario con rol ${req.user.role} intentó acceder a todos los usuarios`);
                return res.status(403).json({ message: 'No autorizado' });
            }

            console.log('Consultando lista de usuarios en la base de datos');
            const users = await userRepository.find({
                select: ['id', 'name', 'email', 'role', 'phone', 'isActive', 'createdAt']
            });
            
            console.log(`Se encontraron ${users.length} usuarios en la base de datos`);
            return res.json(users);
        } catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            return res.status(500).json({ 
                message: 'Error al obtener los usuarios',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener un usuario por ID
    static async getUserById(req: Request, res: Response): Promise<Response> {
        try {
            console.log(`Solicitud para obtener usuario con ID: ${req.params.id}`);
            
            if (!req.user) {
                console.log('Error: No hay información de usuario en la solicitud');
                return res.status(401).json({ message: 'No autenticado' });
            }
            
            const user = await userRepository.findOne({
                where: { id: req.params.id },
                select: ['id', 'name', 'email', 'role', 'phone', 'isActive', 'createdAt']
            });

            if (!user) {
                console.log(`Usuario con ID ${req.params.id} no encontrado`);
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Solo el admin o el propio usuario pueden ver los detalles
            if (req.user?.role !== UserRole.ADMIN && req.user?.id !== user.id) {
                console.log(`Usuario ${req.user.id} intentó acceder a datos de usuario ${user.id}`);
                return res.status(403).json({ message: 'No autorizado' });
            }

            console.log(`Datos de usuario ${user.id} enviados correctamente`);
            return res.json(user);
        } catch (error) {
            console.error(`Error al obtener usuario por ID ${req.params.id}:`, error);
            return res.status(500).json({ 
                message: 'Error al obtener el usuario',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Actualizar un usuario
    static async updateUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { name, email, phone, role, isActive } = req.body;
            
            console.log(`Solicitud para actualizar usuario con ID: ${id}`);
            console.log('Datos para actualizar:', { name, email, phone, role, isActive });
            
            if (!req.user) {
                console.log('Error: No hay información de usuario en la solicitud');
                return res.status(401).json({ message: 'No autenticado' });
            }

            const user = await userRepository.findOneBy({ id });
            if (!user) {
                console.log(`Usuario con ID ${id} no encontrado`);
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Solo el admin puede cambiar el rol y estado
            if (req.user?.role !== UserRole.ADMIN) {
                if (role || isActive !== undefined) {
                    console.log(`Usuario con rol ${req.user.role} intentó cambiar rol o estado`);
                    return res.status(403).json({ message: 'No autorizado para cambiar rol o estado' });
                }
                // Solo puede actualizar su propia información
                if (req.user?.id !== user.id) {
                    console.log(`Usuario ${req.user.id} intentó actualizar datos de usuario ${user.id}`);
                    return res.status(403).json({ message: 'No autorizado' });
                }
            }

            // Actualizar campos permitidos
            if (name) user.name = name;
            if (email) user.email = email;
            if (phone) user.phone = phone;
            if (role && req.user?.role === UserRole.ADMIN) user.role = role;
            if (isActive !== undefined && req.user?.role === UserRole.ADMIN) user.isActive = isActive;

            console.log(`Guardando usuario actualizado: ${id}`);
            await userRepository.save(user);
            
            console.log(`Usuario ${id} actualizado correctamente`);
            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                isActive: user.isActive
            });
        } catch (error) {
            console.error(`Error al actualizar usuario con ID ${req.params.id}:`, error);
            return res.status(500).json({
                message: 'Error al actualizar el usuario',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Cambiar contraseña
    static async changePassword(req: Request, res: Response): Promise<Response> {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.params.id;

            console.log(`Solicitud para cambiar contraseña de usuario: ${userId}`);
            
            if (!req.user) {
                console.log('Error: No hay información de usuario en la solicitud');
                return res.status(401).json({ message: 'No autenticado' });
            }

            const user = await userRepository.findOneBy({ id: userId });
            if (!user) {
                console.log(`Usuario con ID ${userId} no encontrado`);
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Verificar que el usuario sea el propietario o admin
            if (req.user?.role !== UserRole.ADMIN && req.user?.id !== user.id) {
                console.log(`Usuario ${req.user.id} intentó cambiar contraseña de usuario ${user.id}`);
                return res.status(403).json({ message: 'No autorizado' });
            }

            // Verificar contraseña actual
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                console.log(`Contraseña incorrecta al intentar cambiar contraseña de usuario ${userId}`);
                return res.status(401).json({ message: 'Contraseña actual incorrecta' });
            }

            // Actualizar contraseña
            user.password = await bcrypt.hash(newPassword, 10);
            await userRepository.save(user);
            
            console.log(`Contraseña actualizada correctamente para usuario ${userId}`);
            return res.json({ message: 'Contraseña actualizada correctamente' });
        } catch (error) {
            console.error(`Error al cambiar contraseña de usuario ${req.params.id}:`, error);
            return res.status(500).json({
                message: 'Error al cambiar la contraseña',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Desactivar usuario (solo admin)
    static async deactivateUser(req: Request, res: Response): Promise<Response> {
        try {
            console.log(`Solicitud para desactivar usuario: ${req.params.id}`);
            
            if (!req.user) {
                console.log('Error: No hay información de usuario en la solicitud');
                return res.status(401).json({ message: 'No autenticado' });
            }
            
            if (req.user?.role !== UserRole.ADMIN) {
                console.log(`Usuario con rol ${req.user.role} intentó desactivar a un usuario`);
                return res.status(403).json({ message: 'No autorizado' });
            }

            const user = await userRepository.findOneBy({ id: req.params.id });
            if (!user) {
                console.log(`Usuario con ID ${req.params.id} no encontrado`);
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            user.isActive = false;
            await userRepository.save(user);
            
            console.log(`Usuario ${req.params.id} desactivado correctamente`);
            return res.json({ message: 'Usuario desactivado correctamente' });
        } catch (error) {
            console.error(`Error al desactivar usuario ${req.params.id}:`, error);
            return res.status(500).json({
                message: 'Error al desactivar el usuario',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
} 