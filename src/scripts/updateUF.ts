import { UFService } from '../services/uf.service';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const UF_CACHE_FILE = path.join(__dirname, '../../uf_cache.json');

/**
 * Script para actualizar el valor de UF mediante cron job
 * Ejecutar: node dist/scripts/updateUF.js
 */
async function updateUF() {
    try {
        console.log(`Actualizando valor UF: ${new Date().toISOString()}`);
        
        // Forzar actualización ignorando caché
        const ufValue = await UFService.getUFValue(true);
        
        const cacheData = {
            ufValue,
            lastUpdate: new Date().toISOString()
        };
        
        fs.writeFileSync(
            UF_CACHE_FILE,
            JSON.stringify(cacheData, null, 2),
            'utf8'
        );
        
        console.log(`Valor UF actualizado: ${ufValue}`);
        process.exit(0);
    } catch (error) {
        console.error('Error al actualizar UF:', error);
        process.exit(1);
    }
}

// Ejecutar inmediatamente
updateUF(); 