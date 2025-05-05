"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = exports.PriceCurrency = exports.PropertyAction = exports.PropertyStatus = exports.PropertyType = void 0;
const typeorm_1 = require("typeorm");
var PropertyType;
(function (PropertyType) {
    PropertyType["CASA"] = "casa";
    PropertyType["DEPARTAMENTO"] = "departamento";
    PropertyType["TERRENO"] = "terreno";
    PropertyType["LOCAL"] = "local";
    PropertyType["OFICINA"] = "oficina";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
var PropertyStatus;
(function (PropertyStatus) {
    PropertyStatus["DISPONIBLE"] = "disponible";
    PropertyStatus["RESERVADO"] = "reservado";
    PropertyStatus["VENDIDO"] = "vendido";
    PropertyStatus["ARRENDADO"] = "arrendado";
})(PropertyStatus || (exports.PropertyStatus = PropertyStatus = {}));
var PropertyAction;
(function (PropertyAction) {
    PropertyAction["VENTA"] = "venta";
    PropertyAction["ARRIENDO"] = "arriendo";
})(PropertyAction || (exports.PropertyAction = PropertyAction = {}));
var PriceCurrency;
(function (PriceCurrency) {
    PriceCurrency["UF"] = "uf";
    PriceCurrency["CLP"] = "clp";
})(PriceCurrency || (exports.PriceCurrency = PriceCurrency = {}));
let Property = class Property {
    // Getters y setters para convertir el formato de imágenes
    get imagesArray() {
        return this.images ? this.images.split(',') : [];
    }
    set imagesArray(value) {
        this.images = value.join(',');
    }
};
exports.Property = Property;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Property.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50
    }),
    __metadata("design:type", String)
], Property.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Property.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Property.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Property.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Property.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Property.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Property.prototype, "priceUF", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Property.prototype, "priceCLP", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 10
    }),
    __metadata("design:type", String)
], Property.prototype, "mainPriceCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20
    }),
    __metadata("design:type", String)
], Property.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Property.prototype, "bedrooms", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Property.prototype, "bathrooms", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Property.prototype, "surface", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20
    }),
    __metadata("design:type", String)
], Property.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Property.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Property.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Property.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Property.prototype, "updatedAt", void 0);
exports.Property = Property = __decorate([
    (0, typeorm_1.Entity)('property')
], Property);
