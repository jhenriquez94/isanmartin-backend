"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UFSchedulerService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const uf_service_1 = require("./uf.service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Servicio para programar tareas relacionadas con la UF
 */
class UFSchedulerService {
    /**
     * Inicia el programador de tareas
     */
    static initialize() {
        console.log('Inicializando programador de tareas para UF...');
        this.setupDailyUFUpdate();
        this.loadCachedUFValue();
    }
    /**
     * Configura la actualización diaria del valor UF (a las 00:05 AM)
     */
    static setupDailyUFUpdate() {
        // Programar tarea para que se ejecute a las 00:05 de cada día
        this.scheduledTask = node_cron_1.default.schedule('5 0 * * *', async () => {
            console.log(`Ejecutando actualización programada de UF: ${new Date().toISOString()}`);
            try {
                const ufValue = await uf_service_1.UFService.getUFValue(true); // Forzar actualización ignorando caché
                console.log(`Valor UF actualizado: ${ufValue}`);
                // Guardar en archivo para persistencia entre reinicios
                this.saveUFValueToCache(ufValue);
            }
            catch (error) {
                console.error('Error en actualización programada de UF:', error);
            }
        });
        console.log('Tarea programada configurada: Actualización diaria de UF a las 00:05');
    }
    /**
     * Guarda el valor UF en un archivo de caché
     */
    static saveUFValueToCache(ufValue) {
        try {
            const cacheData = {
                ufValue,
                lastUpdate: new Date().toISOString()
            };
            fs_1.default.writeFileSync(this.UF_CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf8');
            console.log(`Valor UF guardado en caché: ${ufValue}`);
        }
        catch (error) {
            console.error('Error al guardar valor UF en caché:', error);
        }
    }
    /**
     * Carga el valor UF desde el archivo de caché si existe
     */
    static loadCachedUFValue() {
        try {
            if (fs_1.default.existsSync(this.UF_CACHE_FILE)) {
                const cacheContent = fs_1.default.readFileSync(this.UF_CACHE_FILE, 'utf8');
                const cacheData = JSON.parse(cacheContent);
                if (cacheData && typeof cacheData.ufValue === 'number') {
                    // Actualizar el valor en el servicio UF
                    uf_service_1.UFService.setCachedValue(cacheData.ufValue);
                    console.log(`Valor UF cargado desde caché: ${cacheData.ufValue} (actualizado: ${cacheData.lastUpdate})`);
                }
            }
            else {
                console.log('No se encontró archivo de caché de UF');
            }
        }
        catch (error) {
            console.error('Error al cargar valor UF desde caché:', error);
        }
    }
    /**
     * Detiene el programador de tareas
     */
    static stop() {
        if (this.scheduledTask) {
            this.scheduledTask.stop();
            console.log('Programador de tareas de UF detenido');
        }
    }
}
exports.UFSchedulerService = UFSchedulerService;
UFSchedulerService.UF_CACHE_FILE = path_1.default.join(__dirname, '../../uf_cache.json');
UFSchedulerService.scheduledTask = null;
