"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mortgage_controller_1 = require("../controllers/mortgage.controller");
const router = (0, express_1.Router)();
/**
 * @route POST /api/mortgage/calculate
 * @desc Calcula la cuota mensual de un crédito hipotecario
 * @access Public
 */
router.post('/calculate', mortgage_controller_1.MortgageController.calculateMortgage);
exports.default = router;
