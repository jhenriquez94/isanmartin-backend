"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyController = void 0;
const hostinger_config_1 = require("../config/hostinger.config");
const Property_1 = require("../entities/Property");
const uf_service_1 = require("../services/uf.service");
const propertyRepository = hostinger_config_1.AppDataSource.getRepository(Property_1.Property);
// Función auxiliar para la conversión de imágenes
const formatProperty = (property) => {
    // Convertir el campo images de texto a array para la respuesta
    if (!property)
        return property;
    return Object.assign(Object.assign({}, property), { images: property.images ? property.images.split(',') : [] });
};
class PropertyController {
    // Obtener todas las propiedades
    static async getAllProperties(_req, res) {
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
                return Object.assign(Object.assign({}, property), { images: property.images ? property.images.split(',') : [] });
            });
            return res.json(formattedProperties);
        }
        catch (error) {
            console.error('Error al obtener propiedades:', error);
            return res.status(500).json({ message: 'Error al obtener las propiedades' });
        }
    }
    // Obtener una propiedad por ID
    static async getPropertyById(req, res) {
        try {
            const property = await propertyRepository.findOne({
                where: { id: req.params.id }
            });
            if (!property) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }
            return res.json(formatProperty(property));
        }
        catch (error) {
            console.error('Error al obtener propiedad por ID:', error);
            return res.status(500).json({ message: 'Error al obtener la propiedad' });
        }
    }
    // Crear una nueva propiedad
    static async createProperty(req, res) {
        try {
            const _a = req.body, { priceUF, images } = _a, propertyData = __rest(_a, ["priceUF", "images"]);
            // Convertir UF a CLP
            const priceCLP = await uf_service_1.UFService.convertUFToCLP(priceUF);
            // Convertir array de imágenes a texto
            const imagesText = Array.isArray(images) ? images.join(',') : '';
            const property = propertyRepository.create(Object.assign(Object.assign({}, propertyData), { priceUF,
                priceCLP, images: imagesText }));
            const result = await propertyRepository.save(property);
            return res.status(201).json(formatProperty(result));
        }
        catch (error) {
            console.error('Error al crear propiedad:', error);
            return res.status(500).json({ message: 'Error al crear la propiedad' });
        }
    }
    // Actualizar una propiedad
    static async updateProperty(req, res) {
        try {
            const property = await propertyRepository.findOneBy({ id: req.params.id });
            if (!property) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }
            const _a = req.body, { priceUF, images } = _a, updateData = __rest(_a, ["priceUF", "images"]);
            // Preparar datos actualizados
            const dataToUpdate = Object.assign({}, updateData);
            // Si se actualizan las imágenes, convertir array a texto
            if (images !== undefined) {
                dataToUpdate.images = Array.isArray(images) ? images.join(',') : '';
            }
            // Si se actualiza el precio en UF, actualizar también el precio en CLP
            if (priceUF) {
                const priceCLP = await uf_service_1.UFService.convertUFToCLP(priceUF);
                dataToUpdate.priceUF = priceUF;
                dataToUpdate.priceCLP = priceCLP;
            }
            propertyRepository.merge(property, dataToUpdate);
            const result = await propertyRepository.save(property);
            return res.json(formatProperty(result));
        }
        catch (error) {
            console.error('Error al actualizar propiedad:', error);
            return res.status(500).json({ message: 'Error al actualizar la propiedad' });
        }
    }
    // Eliminar una propiedad
    static async deleteProperty(req, res) {
        try {
            const property = await propertyRepository.findOneBy({ id: req.params.id });
            if (!property) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }
            await propertyRepository.remove(property);
            return res.json({ message: 'Propiedad eliminada correctamente' });
        }
        catch (error) {
            console.error('Error al eliminar propiedad:', error);
            return res.status(500).json({ message: 'Error al eliminar la propiedad' });
        }
    }
}
exports.PropertyController = PropertyController;
