import { ObjectType, Field, Int } from '@nestjs/graphql';
import { EstadoPlanConteo } from '../entities/plan-conteo-anual.entity';

@ObjectType()
export class ProgresoGeneralOutput {
  
  @Field(() => Int)
  planId: number;

  @Field(() => Int)
  anno: number;

  @Field(() => EstadoPlanConteo)
  estado: EstadoPlanConteo;

  @Field(() => Int)
  porcentajeProgreso: number;

  @Field(() => Int)
  totalActivos: number;

  @Field(() => Int)
  activosContados: number;

  @Field(() => Int)
  activosEncontrados: number;

  @Field(() => Int)
  activosFaltantes: number;

  @Field(() => Int)
  activosConDiscrepancias: number;

  @Field(() => Int)
  mesesCompletados: number;

  @Field(() => Int)
  mesesPendientes: number;

  @Field(() => Int, { nullable: true })
  mesActual?: number | null;
}