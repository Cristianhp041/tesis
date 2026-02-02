import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { EstadoPlanConteo } from '../entities/plan-conteo-anual.entity';

@ObjectType()
export class DetalleAsignacionOutput {
  
  @Field()
  tipo: string;

  @Field()
  areaId: string;

  @Field()
  areaNombre: string;

  @Field({ nullable: true })
  subclasificacionId?: string;

  @Field({ nullable: true })
  subclasificacionNombre?: string;

  @Field(() => Int)
  cantidad: number;

  @Field(() => [String])
  activosIds: string[];
}

@ObjectType()
export class AsignacionMensualResumenOutput {
  
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  mes: number;

  @Field()
  nombreMes: string;

  @Field(() => Int)
  cantidadAsignada: number;

  @Field(() => Float)
  porcentajeAsignado: number;

  @Field()
  criterioAsignacion: string;

  @Field(() => [DetalleAsignacionOutput])
  detalle: DetalleAsignacionOutput[];
}

@ObjectType()
export class EstadisticasDistribucionOutput {
  
  @Field(() => Float)
  promedioDesviacion: number;

  @Field(() => [Int])
  distribucionReal: number[];

  @Field(() => [String])
  areasIncluidas: string[];
}

@ObjectType()
export class PlanConteoOutput {
  
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  anno: number;

  @Field()
  fechaInicio: Date;

  @Field()
  fechaFin: Date;

  @Field(() => EstadoPlanConteo)
  estado: EstadoPlanConteo;

  @Field(() => Int)
  totalActivos: number;

  @Field(() => Int)
  activosPorMes: number;

  @Field(() => Int)
  toleranciaMin: number;

  @Field(() => Int)
  toleranciaMax: number;

  @Field(() => Int)
  activosContados: number;

  @Field(() => Int)
  activosEncontrados: number;

  @Field(() => Int)
  activosFaltantes: number;

  @Field(() => Int)
  activosConDiscrepancias: number;

  @Field(() => Int)
  porcentajeProgreso: number;

  @Field(() => [AsignacionMensualResumenOutput])
  asignacionesMensuales: AsignacionMensualResumenOutput[];

  @Field(() => EstadisticasDistribucionOutput, { nullable: true })
  estadisticas?: EstadisticasDistribucionOutput;

  @Field({ nullable: true })
  observaciones?: string;

  @Field()
  createdAt: Date;

  @Field()
  createdBy: string;
}