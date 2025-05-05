"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uf_service_1 = require("../services/uf.service");
const router = (0, express_1.Router)();
// Ruta de diagnóstico para verificar la API externa
router.get('/diagnostico', async (_req, res) => {
    try {
        const resultado = await uf_service_1.UFService.diagnosticoAPI();
        return res.json(resultado);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                message: 'Error en el diagnóstico',
                error: error.message
            });
        }
        return res.status(500).json({ message: 'Error desconocido' });
    }
});
// Obtener el valor actual de la UF
router.get('/current', async (_req, res) => {
    try {
        const ufValue = await uf_service_1.UFService.getUFValue();
        return res.json({ value: ufValue });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error al obtener el valor de la UF' });
    }
});
// Convertir de UF a CLP
router.get('/convert', async (req, res) => {
    try {
        const { amount } = req.query;
        if (!amount || isNaN(Number(amount))) {
            return res.status(400).json({ message: 'El monto debe ser un número válido' });
        }
        const priceCLP = await uf_service_1.UFService.convertUFToCLP(Number(amount));
        return res.json({
            uf: Number(amount),
            clp: priceCLP,
            ufValue: await uf_service_1.UFService.getUFValue()
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error al convertir de UF a CLP' });
    }
});
exports.default = router;
