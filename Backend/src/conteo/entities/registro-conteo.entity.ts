import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { AsignacionMensual } from './asignacion-mensual.entity';
import { Aft } from '../../aft/entities/aft.entity';
import { User } from '../../user/entities/user.entity';

export enum TipoDiscrepancia {
  NINGUNA = 'ninguna',
  AREA = 'area',
  FALTANTE = 'faltante',
  OTRO = 'otro',
}

registerEnumType(TipoDiscrepancia, {
  name: 'TipoDiscrepancia',
  description: 'Tipo de discrepancia encontrada durante el conteo',
});

export enum EstadoRegistroConteo {
  PENDIENTE = 'pendiente',
  CONTADO = 'contado',
  REVISADO = 'revisado',
  APROBADO = 'aprobado',
}

registerEnumType(EstadoRegistroConteo, {
  name: 'EstadoRegistroConteo',
  description: 'Estado del registro de conteo',
});

@ObjectType()
@Entity('registro_conteo')
@Index(['asignacionMensualId', 'aftId'], { unique: true })
@Index(['contadoPorId', 'fechaConteo'])
@Index(['tieneDiscrepancia'])
export class RegistroConteo {
  
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => EstadoRegistroConteo)
  @Column({
    type: 'enum',
    enum: EstadoRegistroConteo,
    default: EstadoRegistroConteo.PENDIENTE,
  })
  estado: EstadoRegistroConteo;

  @Field(() => Boolean)
  @Column({ type: 'boolean' })
  encontrado: boolean;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'ubicacion_encontrada' })
  ubicacionEncontrada?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'estado_encontrado' })
  estadoEncontrado?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'area_encontrada' })
  areaEncontrada?: string | null;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false, name: 'tiene_discrepancia' })
  tieneDiscrepancia: boolean;

  @Field(() => TipoDiscrepancia)
  @Column({
    type: 'enum',
    enum: TipoDiscrepancia,
    default: TipoDiscrepancia.NINGUNA,
    name: 'tipo_discrepancia',
  })
  tipoDiscrepancia: TipoDiscrepancia;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true, name: 'descripcion_discrepancia' })
  descripcionDiscrepancia?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  comentarios?: string | null;

  @Field()
  @Column({ type: 'timestamp', name: 'fecha_conteo' })
  fechaConteo: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true, name: 'fecha_revision' })
  fechaRevision?: Date | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true, name: 'comentarios_revision' })
  comentariosRevision?: string | null;

  @Field(() => Boolean, { nullable: true })
  @Column({ type: 'boolean', nullable: true, name: 'revision_aprobada' })
  revisionAprobada?: boolean | null;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false, name: 'correccion_aplicada' })
  correccionAplicada: boolean;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true, name: 'fecha_correccion' })
  fechaCorreccion?: Date | null;

  @Column({ type: 'jsonb', nullable: true, name: 'detalles_correccion' })
  detallesCorreccion?: {
    camposCorregidos?: string[];
    valoresAnteriores?: Record<string, any>;
    valoresNuevos?: Record<string, any>;
  } | null;

  @Field(() => AsignacionMensual)
  @ManyToOne(() => AsignacionMensual, asignacion => asignacion.registrosConteo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'asignacion_mensual_id' })
  asignacionMensual: AsignacionMensual;

  @Column({ name: 'asignacion_mensual_id' })
  asignacionMensualId: number;

  @Field(() => Aft)
  @ManyToOne(() => Aft, { eager: true })
  @JoinColumn({ name: 'aft_id' })
  aft: Aft;

  @Column({ name: 'aft_id' })
  aftId: number;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'contado_por_id' })
  contadoPor: User;

  @Column({ name: 'contado_por_id' })
  contadoPorId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'revisado_por_id' })
  revisadoPor?: User | null;

  @Column({ nullable: true, name: 'revisado_por_id' })
  revisadoPorId?: number | null;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'corregido_por_id' })
  corregidoPor?: User | null;

  @Column({ nullable: true, name: 'corregido_por_id' })
  corregidoPorId?: number | null;

  get cambioArea(): boolean {
    if (!this.areaEncontrada || !this.aft?.area?.nombre) return false;
    return this.areaEncontrada.trim() !== this.aft.area.nombre.trim();
  }

  get necesitaRevision(): boolean {
    return this.tieneDiscrepancia && this.estado === EstadoRegistroConteo.CONTADO;
  }

  get fueRevisado(): boolean {
    return this.estado === EstadoRegistroConteo.REVISADO ||
           this.estado === EstadoRegistroConteo.APROBADO;
  }

  get resumen(): string {
    if (!this.encontrado) {
      return 'Activo NO ENCONTRADO';
    }
    
    if (!this.tieneDiscrepancia) {
      return 'Activo encontrado - Sin discrepancias';
    }
    
    const partes: string[] = ['Activo encontrado'];
    
    if (this.cambioArea) {
      partes.push(`área diferente: ${this.areaEncontrada}`);
    }
    
    return partes.join(' - ');
  }
}