import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'VMAE_PROD_IQVIA', schema: 'dbo' })
export class ProductEntity {
    @PrimaryColumn({ name: 'Código_Presentación' })
    codigoPresentacion: string;

    @Column({ name: 'Descripción_Presentación', nullable: true })
    descripcionPresentacion: string;

    @Column({ name: 'Fecha_Lanzamiento_Presentacion', nullable: true })
    fechaLanzamientoPresentacion: string;

    @Column({ name: 'Size_Pack', nullable: true })
    sizePack: string;

    @Column({ name: 'Stgh_Val', nullable: true })
    stghVal: string;

    @Column({ name: 'Stgh_Mea', nullable: true })
    stghMea: string;

    @Column({ name: 'Volu_Mea', nullable: true })
    voluMea: string;

    @Column({ name: 'Volu_Val', nullable: true })
    voluVal: string;

    @Column({ name: 'Formato_Presentacion', nullable: true })
    formatoPresentacion: string;

    @Column({ name: 'Código_Producto', nullable: true })
    codigoProducto: string;

    @Column({ name: 'Marca_Genérico', nullable: true })
    marcaGenerico: string;

    @Column({ name: 'Ético_Popular', nullable: true })
    eticoPopular: string;

    @Column({ name: 'Molécula', nullable: true })
    molecula: string;

    @Column({ name: 'Código_FF_3', nullable: true })
    codigoFF3: string;

    @Column({ name: 'Descripción_FF_3', nullable: true })
    descripcionFF3: string;

    @Column({ name: 'Código_FF_2', nullable: true })
    codigoFF2: string;

    @Column({ name: 'Descripción_FF_2', nullable: true })
    descripcionFF2: string;

    @Column({ name: 'Código_FF_1', nullable: true })
    codigoFF1: string;

    @Column({ name: 'Descripción_FF_1', nullable: true })
    descripcionFF1: string;

    @Column({ name: 'Código_ATC_4', nullable: true })
    codigoATC4: string;

    @Column({ name: 'Descripción_ATC_4', nullable: true })
    descripcionATC4: string;

    @Column({ name: 'Código_ATC_3', nullable: true })
    codigoATC3: string;

    @Column({ name: 'Descripción_ATC_3', nullable: true })
    descripcionATC3: string;

    @Column({ name: 'Código_ATC_2', nullable: true })
    codigoATC2: string;

    @Column({ name: 'Descripción_ATC_2', nullable: true })
    descripcionATC2: string;

    @Column({ name: 'Código_ATC_1', nullable: true })
    codigoATC1: string;

    @Column({ name: 'Descripción_ATC_1', nullable: true })
    descripcionATC1: string;

    @Column({ name: 'Lab_Laboratorio', nullable: true })
    labLaboratorio: string;

    @Column({ name: 'Descripción_Laboratorio', nullable: true })
    descripcionLaboratorio: string;

    @Column({ name: 'Corporación', nullable: true })
    corporacion: string;

    @Column({ name: 'Descripción_Corporación', nullable: true })
    descripcionCorporacion: string;

    @Column({ name: 'MERCADO', nullable: true })
    mercado: string;

    @Column({ name: 'Descripción_Producto', nullable: true })
    descripcionProducto: string;

    @Column({ name: 'Codigo_Interno', nullable: true })
    codigoInterno: string;

    @Column({ name: 'Producto', nullable: true })
    producto: string;

    @Column({ name: 'Unidad_Negocio', nullable: true })
    unidadNegocio: string;

    @Column({ name: 'Franquicia', nullable: true })
    franquicia: string;

    @Column({ name: 'Laboratorio', nullable: true })
    laboratorio: string;

    @Column({ name: 'Marca_MKT', nullable: true })
    marcaMKT: string;

    @Column({ name: 'Codigo_Presentacion_Final', nullable: true })
    codigoPresentacionFinal: string;

    @Column({ name: 'Descripcion_Producto_Final', nullable: true })
    descripcionProductoFinal: string;

    @Column({ name: 'Origen_Capital', nullable: true })
    origenCapital: string;

    @Column({ name: 'Gerente_Producto', nullable: true })
    gerenteProducto: string;

    @Column({ name: 'Fuente', nullable: true })
    fuente: string;
}
