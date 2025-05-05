import axios from 'axios';

interface UFResponse {
    uf: {
        valor: number;
    };
}

export class UFService {
    private static readonly API_URL = 'https://mindicador.cl/api';
    private static ufValue: number | null = null;
    private static lastFetchTime: number = 0;
    private static readonly CACHE_TIME = 3600000; // 1 hora en milisegundos

    /**
     * Establece un valor en caché para la UF
     * @param value Valor de la UF a establecer en caché
     */
    static setCachedValue(value: number): void {
        this.ufValue = value;
        this.lastFetchTime = Date.now();
        console.log(`Valor UF establecido manualmente en caché: ${value}`);
    }

    /**
     * Realiza un diagnóstico de la conexión con la API
     * @returns Objeto con información de diagnóstico
     */
    static async diagnosticoAPI(): Promise<any> {
        try {
            console.log('Realizando diagnóstico de API...');
            const startTime = Date.now();
            const response = await axios.get(this.API_URL);
            const endTime = Date.now();
            
            return {
                success: true,
                timeMs: endTime - startTime,
                status: response.status,
                headers: response.headers,
                data: response.data,
                ufDetectada: response.data && response.data.uf ? response.data.uf.valor : null
            };
        } catch (error) {
            console.error('Error en diagnóstico de API:', error);
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.message,
                    code: error.code,
                    response: error.response ? {
                        status: error.response.status,
                        data: error.response.data
                    } : null
                };
            }
            return {
                success: false,
                message: 'Error desconocido al contactar API'
            };
        }
    }

    /**
     * Obtiene el valor actual de la UF
     * @param forceUpdate Forzar actualización ignorando caché
     * @returns Valor de la UF en pesos chilenos
     */
    static async getUFValue(forceUpdate: boolean = false): Promise<number> {
        const now = Date.now();
        
        // Si el valor está en caché y es reciente (menos de 1 hora), y no se fuerza actualización
        if (this.ufValue !== null && !forceUpdate && (now - this.lastFetchTime) < this.CACHE_TIME) {
            console.log(`Usando valor de UF en caché: ${this.ufValue}`);
            return this.ufValue;
        }
        
        try {
            console.log('Consultando API para obtener valor UF actual...');
            // Obtener el valor actual de la UF desde la API
            const response = await axios.get<any>(this.API_URL);
            
            console.log('Respuesta de API:', JSON.stringify(response.data, null, 2));
            
            // Verificar estructura de la respuesta
            if (response.data && response.data.uf && typeof response.data.uf.valor !== 'undefined') {
                // Extraer el valor de la UF directamente del objeto uf
                const ufValue = response.data.uf.valor;
                
                // Almacenar en caché
                this.ufValue = ufValue;
                this.lastFetchTime = now;
                
                console.log(`Valor UF obtenido desde API: ${ufValue}`);
                return ufValue;
            } else {
                // La estructura de la respuesta no es la esperada
                console.error('Formato de respuesta de API inesperado:', response.data);
                throw new Error('Formato de respuesta inesperado');
            }
        } catch (error) {
            console.error('Error al obtener valor UF:', error);
            
            // Si hay un error y tenemos un valor en caché, usarlo aunque esté expirado
            if (this.ufValue !== null) {
                console.log(`Usando valor de UF en caché expirado: ${this.ufValue}`);
                return this.ufValue;
            }
            
            // Si no hay valor en caché, usar un valor por defecto
            const defaultValue = 39101.4;
            console.log(`Usando valor de UF por defecto: ${defaultValue}`);
            return defaultValue; // Valor actualizado de la UF según la documentación
        }
    }
    
    /**
     * Convierte un monto en UF a pesos chilenos
     * @param amountUF Monto en UF
     * @returns Monto en pesos chilenos
     */
    static async convertUFToCLP(amountUF: number): Promise<number> {
        const ufValue = await this.getUFValue();
        const result = Math.round(amountUF * ufValue);
        console.log(`Conversión: ${amountUF} UF = ${result} CLP (valor UF: ${ufValue})`);
        return result;
    }
    
    /**
     * Convierte un monto en pesos chilenos a UF
     * @param amountCLP Monto en pesos chilenos
     * @returns Monto en UF
     */
    static async convertCLPToUF(amountCLP: number): Promise<number> {
        const ufValue = await this.getUFValue();
        const result = parseFloat((amountCLP / ufValue).toFixed(2));
        console.log(`Conversión: ${amountCLP} CLP = ${result} UF (valor UF: ${ufValue})`);
        return result;
    }
} 