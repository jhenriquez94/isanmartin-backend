"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const Property_1 = require("../entities/Property");
async function updateProperties() {
    try {
        // Inicializar la conexión a la base de datos
        await database_1.AppDataSource.initialize();
        console.log('Conexión a la base de datos establecida');
        const propertyRepository = database_1.AppDataSource.getRepository(Property_1.Property);
        // Obtener todas las propiedades que no tienen los nuevos campos configurados
        const properties = await propertyRepository.find();
        console.log(`Se encontraron ${properties.length} propiedades para actualizar.`);
        // Actualizar las propiedades
        let updated = 0;
        for (const property of properties) {
            // Asignar valores por defecto a los campos nuevos
            if (!property.mainPriceCurrency) {
                property.mainPriceCurrency = Property_1.PriceCurrency.UF;
            }
            if (!property.action) {
                // Si la propiedad está arrendada, asumimos que es de arriendo
                // Si no, asumimos que es de venta
                property.action = property.status === 'arrendado'
                    ? Property_1.PropertyAction.ARRIENDO
                    : Property_1.PropertyAction.VENTA;
            }
            await propertyRepository.save(property);
            updated++;
        }
        console.log(`Se actualizaron ${updated} propiedades.`);
        // Cerrar la conexión
        await database_1.AppDataSource.destroy();
        console.log('Conexión a la base de datos cerrada');
    }
    catch (error) {
        console.error('Error al actualizar las propiedades:', error);
    }
}
// Ejecutar la función
updateProperties();
