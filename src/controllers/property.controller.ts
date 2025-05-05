import { Request, Response } from 'express';
import { AppDataSource } from '../config/hostinger.config';
import { Property } from '../entities/Property';
import { UFService } from '../services/uf.service';

const propertyRepository = AppDataSource.getRepository(Property);

// Función auxiliar para la conversión de imágenes
const formatProperty = (property: any) => {
    // Convertir el campo images de texto a array para la respuesta
    if (!property) return property;
    
    return {
        ...property,
        images: property.images ? property.images.split(',') : []
    };
};

export class PropertyController {
    // Obtener todas las propiedades
    static async getAllProperties(_req: Request, res: Response): Promise<Response> {
        try {
            const properties = await propertyRepository.find({
                select: [
                    'id', 'title', 'description', 'type', 'address', 'city', 'region',
                    'priceUF', 'priceCLP', 'mainPriceCurrency', 'action',
                    'bedrooms', 'bathrooms', 'surface', 'status',
                    'images', 'isFeatured', 'createdAt', 'updatedAt'
                ]
            });
            
            // Convertir imágenes en cada propiedad
            const formattedProperties = properties.map(property => {
                return {
                    ...property,
                    images: property.images ? property.images.split(',') : []
                };
            });
            
            return res.json(formattedProperties);
        } catch (error) {
            console.error('Error al obtener propiedades:', error);
            return res.status(500).json({ message: 'Error al obtener las propiedades' });
        }
    }

    // Obtener una propiedad por ID
    static async getPropertyById(req: Request, res: Response): Promise<Response> {
        try {
            const property = await propertyRepository.findOne({
                where: { id: req.params.id }
            });
            
            if (!property) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }
            return res.json(formatProperty(property));
        } catch (error) {
            console.error('Error al obtener propiedad por ID:', error);
            return res.status(500).json({ message: 'Error al obtener la propiedad' });
        }
    }

    // Crear una nueva propiedad
    static async createProperty(req: Request, res: Response): Promise<Response> {
        try {
            const { priceUF, images, ...propertyData } = req.body;
            
            // Convertir UF a CLP
            const priceCLP = await UFService.convertUFToCLP(priceUF);
            
            // Convertir array de imágenes a texto
            const imagesText = Array.isArray(images) ? images.join(',') : '';
            
            const property = propertyRepository.create({
                ...propertyData,
                priceUF,
                priceCLP,
                images: imagesText
            });
            
            const result = await propertyRepository.save(property);
            return res.status(201).json(formatProperty(result));
        } catch (error) {
            console.error('Error al crear propiedad:', error);
            return res.status(500).json({ message: 'Error al crear la propiedad' });
        }
    }

    // Actualizar una propiedad
    static async updateProperty(req: Request, res: Response): Promise<Response> {
        try {
            const property = await propertyRepository.findOneBy({ id: req.params.id });
            if (!property) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }

            const { priceUF, images, ...updateData } = req.body;
            
            // Preparar datos actualizados
            const dataToUpdate: any = { ...updateData };
            
            // Si se actualizan las imágenes, convertir array a texto
            if (images !== undefined) {
                dataToUpdate.images = Array.isArray(images) ? images.join(',') : '';
            }
            
            // Si se actualiza el precio en UF, actualizar también el precio en CLP
            if (priceUF) {
                const priceCLP = await UFService.convertUFToCLP(priceUF);
                dataToUpdate.priceUF = priceUF;
                dataToUpdate.priceCLP = priceCLP;
            }
            
            propertyRepository.merge(property, dataToUpdate);
            
            const result = await propertyRepository.save(property);
            return res.json(formatProperty(result));
        } catch (error) {
            console.error('Error al actualizar propiedad:', error);
            return res.status(500).json({ message: 'Error al actualizar la propiedad' });
        }
    }

    // Eliminar una propiedad
    static async deleteProperty(req: Request, res: Response): Promise<Response> {
        try {
            const property = await propertyRepository.findOneBy({ id: req.params.id });
            if (!property) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }
            await propertyRepository.remove(property);
            return res.json({ message: 'Propiedad eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar propiedad:', error);
            return res.status(500).json({ message: 'Error al eliminar la propiedad' });
        }
    }
} 