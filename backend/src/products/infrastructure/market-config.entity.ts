import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'conf_mcdo_iqvia', schema: 'dbo' })
export class MarketConfigEntity {
    @PrimaryColumn({ name: 'CODIGO' })
    codigo: string;

    @Column({ name: 'MERCADO', nullable: true })
    mercado: string;

    @Column({ name: 'TIPO', nullable: true })
    tipo: string;

    @Column({ name: 'UNICO_TIPO', nullable: true })
    unicoTipo: number;

    @Column({ name: 'FRANQUICIA', nullable: true })
    franquicia: string;

    @Column({ name: 'GERENTE', nullable: true })
    gerente: string;

    @Column({ name: 'UNIDAD_NEGOCIO', nullable: true })
    unidadNegocio: string;

    @Column({ name: 'CONTRATADO_CU', nullable: true })
    contratadoCu: string;

    @Column({ name: 'ATC', nullable: true })
    atc: string;

    @Column({ name: 'MOLECULA', nullable: true })
    molecula: string;

    @Column({ name: 'F1', nullable: true })
    f1: string;

    @Column({ name: 'Código_FF_3', nullable: true })
    codigoFf3: string;

    @Column({ name: 'STGH_VAL', nullable: true })
    stghVal: string;

    @Column({ name: 'COD_PACK', nullable: true })
    codPack: string;

    @Column({ name: 'PACK', nullable: true })
    pack: string;
}
