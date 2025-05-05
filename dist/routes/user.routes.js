"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authMiddleware);
// Rutas de usuarios
router.get('/', user_controller_1.UserController.getAllUsers);
router.get('/:id', user_controller_1.UserController.getUserById);
router.put('/:id', user_controller_1.UserController.updateUser);
router.post('/:id/change-password', user_controller_1.UserController.changePassword);
router.post('/:id/deactivate', user_controller_1.UserController.deactivateUser);
exports.default = router;
