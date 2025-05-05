import { Router } from 'express';
import { MortgageController } from '../controllers/mortgage.controller';

const router = Router();

/**
 * @route POST /api/mortgage/calculate
 * @desc Calcula la cuota mensual de un crédito hipotecario
 * @access Public
 */
router.post('/calculate', MortgageController.calculateMortgage);

export default router; 