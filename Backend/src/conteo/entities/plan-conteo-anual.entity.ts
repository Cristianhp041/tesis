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
import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { AsignacionMensual } from './asignacion-mensual.entity';

export enum EstadoPlanConteo {
  PLANIFICADO = 'planificado',
  EN_CURSO = 'en_curso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

registerEnumType(EstadoPlanConteo, {
  name: 'EstadoPlanConteo',
  description: 'Estado del plan de conteo anual',
});

@ObjectType()
@Entity('plan_conteo_anual')
export class PlanConteoAnual {
  
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => Int )
  @Column({ type: 'int' })
  anno: number;

  @Field()
  @Column({ type: 'timestamp', name: 'fecha_inicio' })
  fechaInicio: Date;

  @Field()
  @Column({ type: 'timestamp', name: 'fecha_fin' })
  fechaFin: Date;

  @Field(() => EstadoPlanConteo)
  @Column({
    type: 'enum',
    enum: EstadoPlanConteo,
    default: EstadoPlanConteo.PLANIFICADO,
  })
  estado: EstadoPlanConteo;

  @Field(() => Int)
  @Column({ type: 'int', name: 'total_activos' })
  totalActivos: number;

  @Field(() => Int)
  @Column({ type: 'int', name: 'activos_por_mes' })
  activosPorMes: number;

  @Field(() => Int)
  @Column({ type: 'int', name: 'tolerancia_min' })
  toleranciaMin: number;

  @Field(() => Int)
  @Column({ type: 'int', name: 'tolerancia_max' })
  toleranciaMax: number;

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

  @Column({ type: 'jsonb', nullable: true, name: 'configuracion_algoritmo' })
  configuracionAlgoritmo?: {
    version?: string;
    parametros?: Record<string, any>;
    timestamp?: Date;
  } | null;

  @Column({ type: 'jsonb', nullable: true, name: 'estadisticas_distribucion' })
  estadisticasDistribucion?: {
    promedioDesviacion?: number;
    distribucionReal?: number[];
    areasPorMes?: Record<number, string[]>;
  } | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  observaciones?: string | null;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id' })
  createdById: number;

  @Field(() => [AsignacionMensual])
  @OneToMany(() => AsignacionMensual, asignacion => asignacion.planConteo, {
    cascade: true,
  })
  asignacionesMensuales: AsignacionMensual[];

  @Field(() => Int)
  get porcentajeProgreso(): number {
    if (this.totalActivos === 0) return 0;
    return Math.round((this.activosContados / this.totalActivos) * 100);
  }

  get estaActivo(): boolean {
    return this.estado === EstadoPlanConteo.EN_CURSO;
  }

  get estaCompletado(): boolean {
    return this.estado === EstadoPlanConteo.COMPLETADO;
  }

  getMesActual(): number | null {
    const hoy = new Date();
    
    if (hoy < this.fechaInicio || hoy > this.fechaFin) {
      return null;
    }

    const inicio = new Date(this.fechaInicio);
    const mesInicio = inicio.getMonth();
    const mesActual = hoy.getMonth();
    const annoInicio = inicio.getFullYear();
    const annoActual = hoy.getFullYear();

    let diferenciaMeses = (annoActual - annoInicio) * 12 + (mesActual - mesInicio);
    const mesPlan = diferenciaMeses + 1;
    
    return mesPlan >= 1 && mesPlan <= 10 ? mesPlan : null;
  }
}