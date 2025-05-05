"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uf_service_1 = require("../services/uf.service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
// Cargar variables de entorno
dotenv.config();
const UF_CACHE_FILE = path_1.default.join(__dirname, '../../uf_cache.json');
/**
 * Script para actualizar el valor de UF mediante cron job
 * Ejecutar: node dist/scripts/updateUF.js
 */
async function updateUF() {
    try {
        console.log(`Actualizando valor UF: ${new Date().toISOString()}`);
        // Forzar actualización ignorando caché
        const ufValue = await uf_service_1.UFService.getUFValue(true);
        const cacheData = {
            ufValue,
            lastUpdate: new Date().toISOString()
        };
        fs_1.default.writeFileSync(UF_CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf8');
        console.log(`Valor UF actualizado: ${ufValue}`);
        process.exit(0);
    }
    catch (error) {
        console.error('Error al actualizar UF:', error);
        process.exit(1);
    }
}
// Ejecutar inmediatamente
updateUF();
