import cron from 'node-cron';
import { UFService } from './uf.service';
import fs from 'fs';
import path from 'path';

/**
 * Servicio para programar tareas relacionadas con la UF
 */
export class UFSchedulerService {
    private static readonly UF_CACHE_FILE = path.join(__dirname, '../../uf_cache.json');
    private static scheduledTask: cron.ScheduledTask | null = null;

    /**
     * Inicia el programador de tareas
     */
    static initialize(): void {
        console.log('Inicializando programador de tareas para UF...');
        this.setupDailyUFUpdate();
        this.loadCachedUFValue();
    }

    /**
     * Configura la actualización diaria del valor UF (a las 00:05 AM)
     */
    private static setupDailyUFUpdate(): void {
        // Programar tarea para que se ejecute a las 00:05 de cada día
        this.scheduledTask = cron.schedule('5 0 * * *', async () => {
            console.log(`Ejecutando actualización programada de UF: ${new Date().toISOString()}`);
            try {
                const ufValue = await UFService.getUFValue(true); // Forzar actualización ignorando caché
                console.log(`Valor UF actualizado: ${ufValue}`);
                
                // Guardar en archivo para persistencia entre reinicios
                this.saveUFValueToCache(ufValue);
            } catch (error) {
                console.error('Error en actualización programada de UF:', error);
            }
        });
        
        console.log('Tarea programada configurada: Actualización diaria de UF a las 00:05');
    }
    
    /**
     * Guarda el valor UF en un archivo de caché
     */
    private static saveUFValueToCache(ufValue: number): void {
        try {
            const cacheData = {
                ufValue,
                lastUpdate: new Date().toISOString()
            };
            
            fs.writeFileSync(
                this.UF_CACHE_FILE, 
                JSON.stringify(cacheData, null, 2),
                'utf8'
            );
            
            console.log(`Valor UF guardado en caché: ${ufValue}`);
        } catch (error) {
            console.error('Error al guardar valor UF en caché:', error);
        }
    }
    
    /**
     * Carga el valor UF desde el archivo de caché si existe
     */
    private static loadCachedUFValue(): void {
        try {
            if (fs.existsSync(this.UF_CACHE_FILE)) {
                const cacheContent = fs.readFileSync(this.UF_CACHE_FILE, 'utf8');
                const cacheData = JSON.parse(cacheContent);
                
                if (cacheData && typeof cacheData.ufValue === 'number') {
                    // Actualizar el valor en el servicio UF
                    UFService.setCachedValue(cacheData.ufValue);
                    console.log(`Valor UF cargado desde caché: ${cacheData.ufValue} (actualizado: ${cacheData.lastUpdate})`);
                }
            } else {
                console.log('No se encontró archivo de caché de UF');
            }
        } catch (error) {
            console.error('Error al cargar valor UF desde caché:', error);
        }
    }
    
    /**
     * Detiene el programador de tareas
     */
    static stop(): void {
        if (this.scheduledTask) {
            this.scheduledTask.stop();
            console.log('Programador de tareas de UF detenido');
        }
    }
} 