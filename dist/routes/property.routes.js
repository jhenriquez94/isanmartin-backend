"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const property_controller_1 = require("../controllers/property.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const uf_service_1 = require("../services/uf.service");
const router = (0, express_1.Router)();
// Rutas públicas
router.get('/', property_controller_1.PropertyController.getAllProperties);
// Ruta para obtener el valor actual de la UF
router.get('/uf/current', async (_req, res) => {
    try {
        const ufValue = await uf_service_1.UFService.getUFValue();
        return res.json({ value: ufValue });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error al obtener el valor de la UF' });
    }
});
router.get('/:id', property_controller_1.PropertyController.getPropertyById);
// Rutas protegidas
router.use(auth_middleware_1.authMiddleware);
router.post('/', property_controller_1.PropertyController.createProperty);
router.put('/:id', property_controller_1.PropertyController.updateProperty);
router.delete('/:id', property_controller_1.PropertyController.deleteProperty);
exports.default = router;
