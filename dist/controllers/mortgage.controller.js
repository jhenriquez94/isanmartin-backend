"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MortgageController = void 0;
const mortgage_service_1 = require("../services/mortgage.service");
class MortgageController {
    /**
     * Calcula la cuota mensual de un crédito hipotecario
     */
    static async calculateMortgage(req, res) {
        try {
            const { amountUF, interestRate, years } = req.body;
            // Validar parámetros
            if (!amountUF || !interestRate || !years) {
                return res.status(400).json({
                    message: 'Los campos amountUF, interestRate y years son obligatorios'
                });
            }
            if (amountUF <= 0 || interestRate <= 0 || years <= 0) {
                return res.status(400).json({
                    message: 'Los valores deben ser mayores a cero'
                });
            }
            // Calcular hipoteca
            const result = await mortgage_service_1.MortgageService.calculateMortgage(parseFloat(amountUF), parseFloat(interestRate), parseInt(years));
            return res.json(result);
        }
        catch (error) {
            console.error('Error en cálculo de hipoteca:', error);
            return res.status(500).json({
                message: 'Error al calcular la hipoteca'
            });
        }
    }
}
exports.MortgageController = MortgageController;
