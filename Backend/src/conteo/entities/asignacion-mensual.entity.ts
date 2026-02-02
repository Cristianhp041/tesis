import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';
import { PlanConteoAnual } from './plan-conteo-anual.entity';
import { RegistroConteo } from './registro-conteo.entity';
import { User } from '../../user/entities/user.entity';

export enum EstadoAsignacionMensual {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  COMPLETADO = 'completado',
  CERRADO = 'cerrado',
}

registerEnumType(EstadoAsignacionMensual, {
  name: 'EstadoAsignacionMensual',
  description: 'Estado de la asignación mensual',
});

@ObjectType()
@Entity('asignacion_mensual')
export class AsignacionMensual {
  
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'plan_conteo_id' })
  planConteoId: number;

  @Field(() => PlanConteoAnual)
  @ManyToOne(() => PlanConteoAnual, plan => plan.asignacionesMensuales)
  @JoinColumn({ name: 'plan_conteo_id' })
  planConteo: PlanConteoAnual;

  @Field(() => Int)
  @Column({ type: 'int' })
  mes: number;

  @Field()
  @Column({ type: 'varchar', length: 20, name: 'nombre_mes' })
  nombreMes: string;

  @Field(() => Int)
  @Column({ type: 'int', name: 'mes_calendario' })
  mesCalendario: number;

  @Field(() => Int)
  @Column({ type: 'int' })
  anno: number;

  @Field(() => EstadoAsignacionMensual)
  @Column({
    type: 'enum',
    enum: EstadoAsignacionMensual,
    default: EstadoAsignacionMensual.PENDIENTE,
  })
  estado: EstadoAsignacionMensual;

  @Field(() => Float)
  @Column({ type: 'float', name: 'porcentaje_asignado' })
  porcentajeAsignado: number;

  @Field(() => Int)
  @Column({ type: 'int', name: 'cantidad_asignada' })
  cantidadAsignada: number;

  @Field()
  @Column({ type: 'text', name: 'criterio_asignacion' })
  criterioAsignacion: string;

  @Column({ type: 'jsonb', name: 'activos_asignados' })
  activosAsignados: number[];

  @Column({ type: 'jsonb', name: 'detalle_asignacion' })
  detalleAsignacion: Record<string, unknown>;

  @Field()
  @Column({ type: 'timestamp', name: 'fecha_inicio' })
  fechaInicio: Date;

  @Field()
  @Column({ type: 'timestamp', name: 'fecha_limite' })
  fechaLimite: Date;

  @Field(() => Int)
  @Column({ type: 'int', name: 'activos_contados', default: 0 })
  activosContados: number;

  @Field(() => Int)
  @Column({ type: 'int', name: 'activos_encontrados', default: 0 })
  activosEncontrados: number;

  @Field(() => Int)
  @Column({ type: 'int', name: 'activos_faltantes', default: 0 })
  activosFaltantes: number;

  @Field(() => Int)
  @Column({ type: 'int', name: 'activos_con_discrepancias', default: 0 })
  activosConDiscrepancias: number;

  @Field(() => Boolean)
  @Column({ type: 'boolean', name: 'confirmado_conteo', default: false })
  confirmadoConteo: boolean;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', name: 'confirmado_por_id', nullable: true })
  confirmadoPorId?: number;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  fechaConfirmacion?: Date;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'confirmado_por_id' })
  confirmadoPor?: User;

  @OneToMany(() => RegistroConteo, registro => registro.asignacionMensual)
  registrosConteo: RegistroConteo[];

  @Field(() => Int)
  get porcentajeProgreso(): number {
    if (this.cantidadAsignada === 0) return 0;
    return Math.round((this.activosContados / this.cantidadAsignada) * 100);
  }

  @Field(() => Float)
  get tasaEncontrados(): number {
    if (this.activosContados === 0) return 0;
    return Math.round((this.activosEncontrados / this.activosContados) * 100);
  }

  get estaActivo(): boolean {
    return this.estado === EstadoAsignacionMensual.EN_PROCESO;
  }

  get estaCompletado(): boolean {
    return this.estado === EstadoAsignacionMensual.COMPLETADO || 
           this.estado === EstadoAsignacionMensual.CERRADO;
  }

  @Field(() => Boolean)
  get estaTodoContado(): boolean {
    return this.activosContados === this.cantidadAsignada && this.cantidadAsignada > 0;
  }

  getDiasRestantes(): number {
    const hoy = new Date();
    const limite = new Date(this.fechaLimite);
    const diff = limite.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}