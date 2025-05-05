"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const Property_1 = require("../entities/Property");
const uf_service_1 = require("../services/uf.service");
/**
 * Genera propiedades de demostración para la base de datos
 */
async function createDemoProperties() {
    try {
        // Inicializar la conexión a la base de datos
        if (!database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.initialize();
            console.log('Conexión a la base de datos establecida');
        }
        // Verificar si ya hay propiedades en la base de datos
        const propertyCount = await database_1.AppDataSource.getRepository(Property_1.Property).count();
        // Si ya hay propiedades, no crear nuevas
        if (propertyCount > 0) {
            console.log(`Ya existen ${propertyCount} propiedades en la base de datos. No se crearán propiedades de demostración.`);
            await database_1.AppDataSource.destroy();
            console.log('Conexión a la base de datos cerrada');
            return;
        }
        // Obtener el valor actual de UF para hacer las conversiones
        const ufValue = await uf_service_1.UFService.getUFValue();
        console.log(`Valor actual de la UF: ${ufValue}`);
        // Propiedades de demostración
        const demoProperties = [
            {
                type: Property_1.PropertyType.CASA,
                title: 'Casa moderna en Lo Barnechea',
                description: 'Hermosa casa moderna en sector exclusivo de Lo Barnechea con amplio jardín, piscina y vistas panorámicas a la cordillera. Cuenta con 5 dormitorios, 4 baños, sala de estar, comedor, cocina equipada, sala de juegos y estacionamiento para 3 vehículos.',
                address: 'Av. Las Condes 13450',
                city: 'Santiago',
                region: 'Metropolitana',
                priceUF: 18500,
                bedrooms: 5,
                bathrooms: 4,
                surface: 350,
                status: Property_1.PropertyStatus.DISPONIBLE,
                action: Property_1.PropertyAction.VENTA,
                mainPriceCurrency: Property_1.PriceCurrency.UF,
                images: [
                    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
                    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83',
                    'https://images.unsplash.com/photo-1568605114967-8130f3a36994'
                ],
                isFeatured: true
            },
            {
                type: Property_1.PropertyType.DEPARTAMENTO,
                title: 'Departamento en Las Condes - Metro Alcántara',
                description: 'Moderno departamento de 2 dormitorios y 2 baños en excelente ubicación de Las Condes, cerca del metro Alcántara. El departamento cuenta con terraza, cocina equipada, living comedor y un estacionamiento. El edificio dispone de piscina, gimnasio y seguridad 24/7.',
                address: 'Av. Apoquindo 4400',
                city: 'Santiago',
                region: 'Metropolitana',
                priceUF: 7800,
                bedrooms: 2,
                bathrooms: 2,
                surface: 85,
                status: Property_1.PropertyStatus.DISPONIBLE,
                action: Property_1.PropertyAction.VENTA,
                mainPriceCurrency: Property_1.PriceCurrency.UF,
                images: [
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
                    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc',
                    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d'
                ],
                isFeatured: true
            },
            {
                type: Property_1.PropertyType.CASA,
                title: 'Casa en Condominio - Chicureo',
                description: 'Amplia casa en exclusivo condominio de Chicureo, con seguridad 24/7, áreas verdes y club house. La propiedad cuenta con 4 dormitorios, 3 baños, sala de estar, comedor, cocina amoblada, terraza y jardín con quincho. Excelente oportunidad para familias.',
                address: 'Camino Chicureo Km 2',
                city: 'Colina',
                region: 'Metropolitana',
                priceUF: 14200,
                bedrooms: 4,
                bathrooms: 3,
                surface: 280,
                status: Property_1.PropertyStatus.DISPONIBLE,
                action: Property_1.PropertyAction.VENTA,
                mainPriceCurrency: Property_1.PriceCurrency.UF,
                images: [
                    'https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb',
                    'https://images.unsplash.com/photo-1584622781564-1d987f7333c1',
                    'https://images.unsplash.com/photo-1576941089067-2de3c901e126'
                ],
                isFeatured: false
            },
            {
                type: Property_1.PropertyType.DEPARTAMENTO,
                title: 'Departamento nuevo en Ñuñoa',
                description: 'Departamento a estrenar en barrio residencial de Ñuñoa, cerca de Plaza Egaña. Cuenta con 3 dormitorios, 2 baños, living comedor, cocina equipada y terraza. El edificio tiene piscina, gimnasio, sala multiuso y seguridad.',
                address: 'Av. Irarrázaval 3600',
                city: 'Santiago',
                region: 'Metropolitana',
                priceUF: 5600,
                bedrooms: 3,
                bathrooms: 2,
                surface: 110,
                status: Property_1.PropertyStatus.DISPONIBLE,
                action: Property_1.PropertyAction.VENTA,
                mainPriceCurrency: Property_1.PriceCurrency.UF,
                images: [
                    'https://images.unsplash.com/photo-1524549207884-e7d1130ae2f3',
                    'https://images.unsplash.com/photo-1594484208869-eda7172a547d',
                    'https://images.unsplash.com/photo-1621293954908-907159247fc8'
                ],
                isFeatured: true
            },
            {
                type: Property_1.PropertyType.TERRENO,
                title: 'Terreno con vista al mar - Maitencillo',
                description: 'Terreno en pendiente con espectacular vista al mar, ubicado en el sector exclusivo de Maitencillo. Ideal para construir casa de veraneo o residencia permanente. Cuenta con factibilidad de agua y electricidad.',
                address: 'Camino a Maitencillo Km 3',
                city: 'Puchuncaví',
                region: 'Valparaíso',
                priceUF: 9200,
                bedrooms: 0,
                bathrooms: 0,
                surface: 1200,
                status: Property_1.PropertyStatus.DISPONIBLE,
                action: Property_1.PropertyAction.VENTA,
                mainPriceCurrency: Property_1.PriceCurrency.UF,
                images: [
                    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
                    'https://images.unsplash.com/photo-1511497584788-876760111969',
                    'https://images.unsplash.com/photo-1500382017468-9049fed747ef'
                ],
                isFeatured: false
            },
            {
                type: Property_1.PropertyType.CASA,
                title: 'Casa estilo mediterráneo - Viña del Mar',
                description: 'Hermosa casa estilo mediterráneo en el sector de Reñaca Alto, con vista al mar. La propiedad cuenta con 3 dormitorios, 2 baños, amplio living comedor, cocina equipada, terraza y jardín con piscina. Ideal para residencia permanente o casa de veraneo.',
                address: 'Av. Borgoño 14500',
                city: 'Viña del Mar',
                region: 'Valparaíso',
                priceUF: 12800,
                bedrooms: 3,
                bathrooms: 2,
                surface: 220,
                status: Property_1.PropertyStatus.DISPONIBLE,
                action: Property_1.PropertyAction.VENTA,
                mainPriceCurrency: Property_1.PriceCurrency.UF,
                images: [
                    'https://images.unsplash.com/photo-1598228723793-52759bba239c',
                    'https://images.unsplash.com/photo-1600607686527-6fb886090705',
                    'https://images.unsplash.com/photo-1600607687644-aac4c0aad0c8'
                ],
                isFeatured: true
            },
            {
                type: Property_1.PropertyType.OFICINA,
                title: 'Oficina en Edificio Nueva Las Condes',
                description: 'Moderna oficina en prestigioso edificio del barrio financiero Nueva Las Condes. Espacios de trabajo abiertos, 2 salas de reuniones, kitchenette y 2 baños. Edificio cuenta con seguridad 24/7, estacionamientos de visita y servicios.',
                address: 'Av. Las Condes 11000',
                city: 'Santiago',
                region: 'Metropolitana',
                priceUF: 8500,
                bedrooms: 0,
                bathrooms: 2,
                surface: 120,
                status: Property_1.PropertyStatus.DISPONIBLE,
                action: Property_1.PropertyAction.ARRIENDO,
                mainPriceCurrency: Property_1.PriceCurrency.UF,
                images: [
                    'https://images.unsplash.com/photo-1497366811353-6870744d04b2',
                    'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
                    'https://images.unsplash.com/photo-1524749292158-7540c2494485'
                ],
                isFeatured: false
            },
            {
                type: Property_1.PropertyType.LOCAL,
                title: 'Local comercial en Providencia',
                description: 'Local comercial en excelente ubicación de Providencia, cercano a metro Pedro de Valdivia. Amplia vitrina, baño, bodega y estacionamiento. Alto flujo peatonal, ideal para retail, cafetería o servicios.',
                address: 'Av. Providencia 2140',
                city: 'Santiago',
                region: 'Metropolitana',
                priceUF: 6200,
                bedrooms: 0,
                bathrooms: 1,
                surface: 75,
                status: Property_1.PropertyStatus.DISPONIBLE,
                action: Property_1.PropertyAction.ARRIENDO,
                mainPriceCurrency: Property_1.PriceCurrency.UF,
                images: [
                    'https://images.unsplash.com/photo-1582037928769-181cf8509d65',
                    'https://images.unsplash.com/photo-1534857961336-a3a218c53053',
                    'https://images.unsplash.com/photo-1604328698692-f76ea9498e76'
                ],
                isFeatured: false
            },
            {
                type: Property_1.PropertyType.DEPARTAMENTO,
                title: 'Departamento amoblado para arriendo - Providencia',
                description: 'Acogedor departamento completamente amoblado en el corazón de Providencia. Cuenta con 1 dormitorio, 1 baño, living comedor, cocina equipada y balcón. Edificio con seguridad 24/7, lavandería y estacionamiento de visitas.',
                address: 'Av. Providencia 1500',
                city: 'Santiago',
                region: 'Metropolitana',
                priceUF: 18,
                bedrooms: 1,
                bathrooms: 1,
                surface: 45,
                status: Property_1.PropertyStatus.DISPONIBLE,
                action: Property_1.PropertyAction.ARRIENDO,
                mainPriceCurrency: Property_1.PriceCurrency.UF,
                images: [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
                    'https://images.unsplash.com/photo-1541123437800-1bb1317badc2',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
                ],
                isFeatured: false
            },
            {
                type: Property_1.PropertyType.CASA,
                title: 'Casa con piscina para arriendo - La Reina',
                description: 'Amplia casa en La Reina, perfecta para familias. Cuenta con 4 dormitorios, 3 baños, living comedor, cocina equipada, sala de estar, terraza y hermoso jardín con piscina. Cerca de colegios, comercio y áreas verdes.',
                address: 'Av. Larraín 9500',
                city: 'Santiago',
                region: 'Metropolitana',
                priceUF: 45,
                bedrooms: 4,
                bathrooms: 3,
                surface: 200,
                status: Property_1.PropertyStatus.DISPONIBLE,
                action: Property_1.PropertyAction.ARRIENDO,
                mainPriceCurrency: Property_1.PriceCurrency.UF,
                images: [
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
                    'https://images.unsplash.com/photo-1576941089067-2de3c901e126',
                    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c'
                ],
                isFeatured: true
            }
        ];
        const propertyRepository = database_1.AppDataSource.getRepository(Property_1.Property);
        // Guardar propiedades en la base de datos
        for (const propertyData of demoProperties) {
            // Calcular el precio en CLP
            const priceCLP = propertyData.priceUF * ufValue;
            // Convertir el array de imágenes a texto separado por comas
            const imagesText = propertyData.images.join(',');
            // Crear y guardar la propiedad
            const property = propertyRepository.create(Object.assign(Object.assign({}, propertyData), { priceCLP, images: imagesText // Guardar como texto
             }));
            await propertyRepository.save(property);
            console.log(`Propiedad creada: ${property.title} - ${property.type} en ${property.city}`);
        }
        console.log(`Se han creado ${demoProperties.length} propiedades de demostración`);
        // Cerrar la conexión
        await database_1.AppDataSource.destroy();
        console.log('Conexión a la base de datos cerrada');
    }
    catch (error) {
        console.error('Error al crear propiedades de demostración:', error);
        if (database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.destroy();
            console.log('Conexión a la base de datos cerrada');
        }
        process.exit(1);
    }
}
// Ejecutar la función
createDemoProperties();
