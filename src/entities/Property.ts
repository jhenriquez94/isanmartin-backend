import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PropertyType {
    CASA = 'casa',
    DEPARTAMENTO = 'departamento',
    TERRENO = 'terreno',
    LOCAL = 'local',
    OFICINA = 'oficina'
}

export enum PropertyStatus {
    DISPONIBLE = 'disponible',
    RESERVADO = 'reservado',
    VENDIDO = 'vendido',
    ARRENDADO = 'arrendado'
}

export enum PropertyAction {
    VENTA = 'venta',
    ARRIENDO = 'arriendo'
}

export enum PriceCurrency {
    UF = 'uf',
    CLP = 'clp'
}

@Entity('property')
export class Property {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 50
    })
    type!: PropertyType;

    @Column()
    title!: string;

    @Column('text')
    description!: string;

    @Column()
    address!: string;

    @Column()
    city!: string;

    @Column()
    region!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    priceUF!: number;

    @Column('decimal', { precision: 15, scale: 2 })
    priceCLP!: number;

    @Column({
        type: 'varchar',
        length: 10
    })
    mainPriceCurrency!: PriceCurrency;

    @Column({
        type: 'varchar',
        length: 20
    })
    action!: PropertyAction;

    @Column('int')
    bedrooms!: number;

    @Column('int')
    bathrooms!: number;

    @Column('int')
    surface!: number;

    @Column({
        type: 'varchar',
        length: 20
    })
    status!: PropertyStatus;

    @Column('text')
    images!: string;

    @Column({ default: false })
    isFeatured!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Getters y setters para convertir el formato de imágenes
    get imagesArray(): string[] {
        return this.images ? this.images.split(',') : [];
    }

    set imagesArray(value: string[]) {
        this.images = value.join(',');
    }
} 