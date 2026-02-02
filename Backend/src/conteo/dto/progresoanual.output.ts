import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class ProgresoPorMesOutput {
  
  @Field(() => Int)
  mes: number;

  @Field()
  nombreMes: string;

  @Field(() => Int)
  cantidadAsignada: number;

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

  @Field(() => Float)
  tasaEncontrados: number;

  @Field()
  estado: string;

  @Field()
  estaActivo: boolean;

  @Field()
  estaCompletado: boolean;

  @Field()
  fechaLimite: Date;

  @Field(() => Int)
  diasRestantes: number;
}

@ObjectType()
export class EstadisticasGeneralesOutput {
  
  @Field(() => Int)
  totalActivos: number;

  @Field(() => Int)
  totalContados: number;

  @Field(() => Int)
  totalEncontrados: number;

  @Field(() => Int)
  totalFaltantes: number;

  @Field(() => Int)
  totalConDiscrepancias: number;

  @Field(() => Int)
  porcentajeProgresoGeneral: number;

  @Field(() => Float)
  tasaEncontradosGeneral: number;

  @Field(() => Float)
  tasaFaltantesGeneral: number;

  @Field(() => Float)
  tasaDiscrepanciasGeneral: number;

  @Field(() => Int)
  mesesCompletados: number;

  @Field(() => Int)
  mesesPendientes: number;

  @Field(() => Int, { nullable: true })
  mesActual?: number;

  @Field(() => Float)
  promedioActivosPorMes: number;

  @Field(() => Float)
  desviacionEstandar: number;
}

@ObjectType()
export class TopAreaConDiscrepanciasOutput {
  
  @Field()
  areaNombre: string;

  @Field(() => Int)
  totalDiscrepancias: number;

  @Field(() => Float)
  porcentaje: number;
}

@ObjectType()
export class DistribucionDiscrepanciasOutput {
  
  @Field(() => Int)
  ubicacion: number;

  @Field(() => Int)
  estado: number;

  @Field(() => Int)
  faltante: number;

  @Field(() => Int)
  otro: number;
}

@ObjectType()
export class ProgresoAnualOutput {
  
  @Field()
  planId: string;

  @Field(() => Int)
  anno: number;

  @Field()
  fechaInicio: Date;

  @Field()
  fechaFin: Date;

  @Field()
  estadoPlan: string;

  @Field(() => EstadisticasGeneralesOutput)
  estadisticasGenerales: EstadisticasGeneralesOutput;

  @Field(() => [ProgresoPorMesOutput])
  progresoMeses: ProgresoPorMesOutput[];

  @Field(() => [TopAreaConDiscrepanciasOutput])
  areasConMasDiscrepancias: TopAreaConDiscrepanciasOutput[];

  @Field(() => DistribucionDiscrepanciasOutput)
  distribucionDiscrepancias: DistribucionDiscrepanciasOutput;

  @Field()
  ultimaActualizacion: Date;
}