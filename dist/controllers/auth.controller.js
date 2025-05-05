"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const hostinger_config_1 = require("../config/hostinger.config");
const User_1 = require("../entities/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
class AuthController {
    /**
     * Login: Autentica un usuario y emite un token JWT
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            // Validar que email y password estén presentes
            if (!email || !password) {
                return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
            }
            // Buscar el usuario por email
            const userRepository = hostinger_config_1.AppDataSource.getRepository(User_1.User);
            const user = await userRepository.findOne({ where: { email } });
            // Verificar si el usuario existe
            if (!user) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }
            // Verificar si el usuario está activo
            if (!user.isActive) {
                return res.status(401).json({ message: 'Usuario desactivado' });
            }
            // Verificar la contraseña
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }
            // Generar token JWT
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '24h' });
            // Retornar token y datos básicos del usuario
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }
        catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }
    /**
     * Profile: Retorna la información del usuario autenticado
     */
    static async profile(req, res) {
        try {
            // El middleware de autenticación añade el objeto user a la request
            const userId = req.user.userId;
            // Buscar el usuario por ID
            const userRepository = hostinger_config_1.AppDataSource.getRepository(User_1.User);
            const user = await userRepository.findOne({ where: { id: userId } });
            // Verificar si el usuario existe
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            // Retornar datos del usuario (sin la contraseña)
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                isActive: user.isActive
            });
        }
        catch (error) {
            console.error('Error en profile:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }
    /**
     * Register: Crea un nuevo usuario
     */
    static async register(req, res) {
        try {
            const { name, email, password, phone } = req.body;
            // Validar datos requeridos
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Nombre, correo y contraseña son requeridos' });
            }
            // Verificar si el correo ya está registrado
            const userRepository = hostinger_config_1.AppDataSource.getRepository(User_1.User);
            const existingUser = await userRepository.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'El correo ya está registrado' });
            }
            // Encriptar la contraseña
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            // Crear nuevo usuario (por defecto con rol 'client')
            const user = new User_1.User();
            user.name = name;
            user.email = email;
            user.password = hashedPassword;
            user.role = User_1.UserRole.CLIENT;
            user.phone = phone || null;
            user.isActive = true;
            // Guardar usuario
            await userRepository.save(user);
            // Generar token JWT para el nuevo usuario
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '24h' });
            // Retornar token y datos básicos
            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }
        catch (error) {
            console.error('Error en register:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }
}
exports.AuthController = AuthController;
