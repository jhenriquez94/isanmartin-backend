"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const hostinger_config_1 = require("../config/hostinger.config");
const User_1 = require("../entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userRepository = hostinger_config_1.AppDataSource.getRepository(User_1.User);
class UserController {
    // Obtener todos los usuarios (solo admin)
    static async getAllUsers(req, res) {
        var _a;
        try {
            console.log('Solicitud para obtener todos los usuarios recibida');
            // Verificar autenticación del usuario
            if (!req.user) {
                console.log('Error: No hay información de usuario en la solicitud');
                return res.status(401).json({ message: 'No autenticado' });
            }
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== User_1.UserRole.ADMIN) {
                console.log(`Error: Usuario con rol ${req.user.role} intentó acceder a todos los usuarios`);
                return res.status(403).json({ message: 'No autorizado' });
            }
            console.log('Consultando lista de usuarios en la base de datos');
            const users = await userRepository.find({
                select: ['id', 'name', 'email', 'role', 'phone', 'isActive', 'createdAt']
            });
            console.log(`Se encontraron ${users.length} usuarios en la base de datos`);
            return res.json(users);
        }
        catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            return res.status(500).json({
                message: 'Error al obtener los usuarios',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    // Obtener un usuario por ID
    static async getUserById(req, res) {
        var _a, _b;
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
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== User_1.UserRole.ADMIN && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== user.id) {
                console.log(`Usuario ${req.user.id} intentó acceder a datos de usuario ${user.id}`);
                return res.status(403).json({ message: 'No autorizado' });
            }
            console.log(`Datos de usuario ${user.id} enviados correctamente`);
            return res.json(user);
        }
        catch (error) {
            console.error(`Error al obtener usuario por ID ${req.params.id}:`, error);
            return res.status(500).json({
                message: 'Error al obtener el usuario',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    // Actualizar un usuario
    static async updateUser(req, res) {
        var _a, _b, _c, _d;
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
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== User_1.UserRole.ADMIN) {
                if (role || isActive !== undefined) {
                    console.log(`Usuario con rol ${req.user.role} intentó cambiar rol o estado`);
                    return res.status(403).json({ message: 'No autorizado para cambiar rol o estado' });
                }
                // Solo puede actualizar su propia información
                if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== user.id) {
                    console.log(`Usuario ${req.user.id} intentó actualizar datos de usuario ${user.id}`);
                    return res.status(403).json({ message: 'No autorizado' });
                }
            }
            // Actualizar campos permitidos
            if (name)
                user.name = name;
            if (email)
                user.email = email;
            if (phone)
                user.phone = phone;
            if (role && ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) === User_1.UserRole.ADMIN)
                user.role = role;
            if (isActive !== undefined && ((_d = req.user) === null || _d === void 0 ? void 0 : _d.role) === User_1.UserRole.ADMIN)
                user.isActive = isActive;
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
        }
        catch (error) {
            console.error(`Error al actualizar usuario con ID ${req.params.id}:`, error);
            return res.status(500).json({
                message: 'Error al actualizar el usuario',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    // Cambiar contraseña
    static async changePassword(req, res) {
        var _a, _b;
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
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== User_1.UserRole.ADMIN && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== user.id) {
                console.log(`Usuario ${req.user.id} intentó cambiar contraseña de usuario ${user.id}`);
                return res.status(403).json({ message: 'No autorizado' });
            }
            // Verificar contraseña actual
            const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isValidPassword) {
                console.log(`Contraseña incorrecta al intentar cambiar contraseña de usuario ${userId}`);
                return res.status(401).json({ message: 'Contraseña actual incorrecta' });
            }
            // Actualizar contraseña
            user.password = await bcryptjs_1.default.hash(newPassword, 10);
            await userRepository.save(user);
            console.log(`Contraseña actualizada correctamente para usuario ${userId}`);
            return res.json({ message: 'Contraseña actualizada correctamente' });
        }
        catch (error) {
            console.error(`Error al cambiar contraseña de usuario ${req.params.id}:`, error);
            return res.status(500).json({
                message: 'Error al cambiar la contraseña',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    // Desactivar usuario (solo admin)
    static async deactivateUser(req, res) {
        var _a;
        try {
            console.log(`Solicitud para desactivar usuario: ${req.params.id}`);
            if (!req.user) {
                console.log('Error: No hay información de usuario en la solicitud');
                return res.status(401).json({ message: 'No autenticado' });
            }
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== User_1.UserRole.ADMIN) {
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
        }
        catch (error) {
            console.error(`Error al desactivar usuario ${req.params.id}:`, error);
            return res.status(500).json({
                message: 'Error al desactivar el usuario',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}
exports.UserController = UserController;
