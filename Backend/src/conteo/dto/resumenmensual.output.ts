import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class ResumenPorAreaOutput {
  
  @Field()
  areaId: string;

  @Field()
  areaNombre: string;

  @Field(() => Int)
  totalAsignados: number;

  @Field(() => Int)
  totalContados: number;

  @Field(() => Int)
  totalEncontrados: number;

  @Field(() => Int)
  totalFaltantes: number;

  @Field(() => Int)
  totalConDiscrepancias: number;

  @Field(() => Float)
  porcentajeProgreso: number;

  @Field(() => Float)
  tasaEncontrados: number;
}

@ObjectType()
export class ResumenPorSubclasificacionOutput {
  
  @Field()
  subclasificacionId: string;

  @Field()
  subclasificacionNombre: string;

  @Field()
  areaNombre: string;

  @Field(() => Int)
  totalAsignados: number;

  @Field(() => Int)
  totalContados: number;

  @Field(() => Int)
  totalEncontrados: number;

  @Field(() => Int)
  totalFaltantes: number;

  @Field(() => Float)
  porcentajeProgreso: number;
}

@ObjectType()
export class ContadorPorUsuarioOutput {
  
  @Field()
  usuarioId: string;

  @Field()
  usuarioNombre: string;

  @Field(() => Int)
  totalContados: number;

  @Field(() => Int)
  totalEncontrados: number;

  @Field(() => Int)
  totalFaltantes: number;

  @Field(() => Int)
  totalConDiscrepancias: number;

  @Field(() => Float)
  tasaEncontrados: number;

  @Field()
  ultimoConteo: Date;
}

@ObjectType()
export class TendenciaDiariaOutput {
  
  @Field()
  fecha: Date;

  @Field(() => Int)
  conteosRealizados: number;

  @Field(() => Int)
  encontrados: number;

  @Field(() => Int)
  faltantes: number;

  @Field(() => Int)
  conDiscrepancias: number;
}

@ObjectType()
export class AlertasOutput {
  
  @Field()
  tipo: string;

  @Field()
  mensaje: string;

  @Field()
  nivel: string;

  @Field()
  fecha: Date;
}

@ObjectType()
export class ResumenMensualOutput {
  
  @Field()
  asignacionId: string;

  @Field(() => Int)
  mes: number;

  @Field()
  nombreMes: string;

  @Field()
  estado: string;

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

  @Field(() => Float)
  tasaFaltantes: number;

  @Field(() => Int)
  diasRestantes: number;

  @Field()
  estaVencido: boolean;

  @Field(() => [ResumenPorAreaOutput])
  resumenPorArea: ResumenPorAreaOutput[];

  @Field(() => [ResumenPorSubclasificacionOutput])
  resumenPorSubclasificacion: ResumenPorSubclasificacionOutput[];

  @Field(() => [ContadorPorUsuarioOutput])
  contadoresPorUsuario: ContadorPorUsuarioOutput[];

  @Field(() => [TendenciaDiariaOutput])
  tendenciaDiaria: TendenciaDiariaOutput[];

  @Field(() => [AlertasOutput])
  alertas: AlertasOutput[];

  @Field()
  fechaGeneracion: Date;
}