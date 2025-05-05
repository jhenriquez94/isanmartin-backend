"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MortgageService = void 0;
const uf_service_1 = require("./uf.service");
class MortgageService {
    /**
     * Calcula el pago mensual de un crédito hipotecario
     * @param amountUF Monto del crédito en UF
     * @param interestRate Tasa de interés anual (ej: 3.5 para 3.5%)
     * @param years Plazo en años
     * @returns Objeto con detalles del crédito
     */
    static calculateMonthlyPayment(amountUF, interestRate, years) {
        // Convertir tasa anual a mensual (tasa anual / 12 / 100)
        const monthlyRate = interestRate / 12 / 100;
        // Plazo en meses
        const months = years * 12;
        // Calcular cuota mensual en UF
        // Fórmula: P = A * [ r(1+r)^n ] / [ (1+r)^n - 1 ]
        // P = pago mensual, A = monto del préstamo, r = tasa mensual, n = número de pagos
        const monthlyPaymentUF = amountUF *
            (monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);
        // Calcular costo total del crédito
        const totalPaymentUF = monthlyPaymentUF * months;
        const totalInterestUF = totalPaymentUF - amountUF;
        return {
            monthlyPaymentUF: parseFloat(monthlyPaymentUF.toFixed(2)),
            totalPaymentUF: parseFloat(totalPaymentUF.toFixed(2)),
            totalInterestUF: parseFloat(totalInterestUF.toFixed(2)),
            months
        };
    }
    /**
     * Calcula el pago mensual y convierte los resultados a CLP
     * @param amountUF Monto del crédito en UF
     * @param interestRate Tasa de interés anual
     * @param years Plazo en años
     * @returns Objeto con detalles del crédito en UF y CLP
     */
    static async calculateMortgage(amountUF, interestRate, years) {
        const result = this.calculateMonthlyPayment(amountUF, interestRate, years);
        // Obtener valor UF actual
        const ufValue = await uf_service_1.UFService.getUFValue();
        // Convertir valores a CLP
        const monthlyPaymentCLP = result.monthlyPaymentUF * ufValue;
        const totalPaymentCLP = result.totalPaymentUF * ufValue;
        const totalInterestCLP = result.totalInterestUF * ufValue;
        const amountCLP = amountUF * ufValue;
        return Object.assign(Object.assign({}, result), { ufValue, amountCLP: parseFloat(amountCLP.toFixed(0)), monthlyPaymentCLP: parseFloat(monthlyPaymentCLP.toFixed(0)), totalPaymentCLP: parseFloat(totalPaymentCLP.toFixed(0)), totalInterestCLP: parseFloat(totalInterestCLP.toFixed(0)) });
    }
}
exports.MortgageService = MortgageService;
