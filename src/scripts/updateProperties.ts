import { AppDataSource } from '../config/database';
import { Property, PropertyAction, PriceCurrency } from '../entities/Property';

async function updateProperties() {
  try {
    // Inicializar la conexión a la base de datos
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');

    const propertyRepository = AppDataSource.getRepository(Property);
    
    // Obtener todas las propiedades que no tienen los nuevos campos configurados
    const properties = await propertyRepository.find();
    
    console.log(`Se encontraron ${properties.length} propiedades para actualizar.`);
    
    // Actualizar las propiedades
    let updated = 0;
    
    for (const property of properties) {
      // Asignar valores por defecto a los campos nuevos
      if (!property.mainPriceCurrency) {
        property.mainPriceCurrency = PriceCurrency.UF;
      }
      
      if (!property.action) {
        // Si la propiedad está arrendada, asumimos que es de arriendo
        // Si no, asumimos que es de venta
        property.action = property.status === 'arrendado' 
          ? PropertyAction.ARRIENDO 
          : PropertyAction.VENTA;
      }
      
      await propertyRepository.save(property);
      updated++;
    }
    
    console.log(`Se actualizaron ${updated} propiedades.`);
    
    // Cerrar la conexión
    await AppDataSource.destroy();
    console.log('Conexión a la base de datos cerrada');
  } catch (error) {
    console.error('Error al actualizar las propiedades:', error);
  }
}

// Ejecutar la función
updateProperties(); 