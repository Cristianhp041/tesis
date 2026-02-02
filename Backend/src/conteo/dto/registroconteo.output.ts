import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { TipoDiscrepancia, EstadoRegistroConteo } from '../entities/registro-conteo.entity';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class AFTSimplificadoOutput {
  
  @Field(() => ID)
  id: string;

  @Field()
  codigo: string;

  @Field()
  descripcion: string;

  @Field({ nullable: true })
  ubicacion?: string;

  @Field({ nullable: true })
  estado?: string;

  @Field()
  areaNombre: string;

  @Field({ nullable: true })
  subclasificacionNombre?: string;
}

@ObjectType()
export class UsuarioSimplificadoOutput {
  
  @Field(() => ID)
  id: string;

  @Field()
  nombre: string;

  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
export class RegistroConteoOutput {
  
  @Field(() => ID)
  id: string;

  @Field(() => EstadoRegistroConteo)
  estado: EstadoRegistroConteo;

  @Field()
  encontrado: boolean;

  @Field({ nullable: true })
  ubicacionEncontrada?: string;

  @Field({ nullable: true })
  estadoEncontrado?: string;

  @Field({ nullable: true })
  areaEncontrada?: string;

  @Field()
  tieneDiscrepancia: boolean;

  @Field(() => TipoDiscrepancia)
  tipoDiscrepancia: TipoDiscrepancia;

  @Field({ nullable: true })
  descripcionDiscrepancia?: string;

  @Field({ nullable: true })
  comentarios?: string;

  @Field()
  fechaConteo: Date;

  @Field({ nullable: true })
  fechaRevision?: Date;

  @Field({ nullable: true })
  comentariosRevision?: string;

  @Field({ nullable: true })
  revisionAprobada?: boolean;

  @Field()
  correccionAplicada: boolean;

  @Field({ nullable: true })
  fechaCorreccion?: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  detallesCorreccion?: {
    camposCorregidos?: string[];
    valoresAnteriores?: Record<string, any>;
    valoresNuevos?: Record<string, any>;
  };

  @Field(() => AFTSimplificadoOutput)
  aft: AFTSimplificadoOutput;

  @Field(() => UsuarioSimplificadoOutput)
  contadoPor: UsuarioSimplificadoOutput;

  @Field(() => UsuarioSimplificadoOutput, { nullable: true })
  revisadoPor?: UsuarioSimplificadoOutput;

  @Field(() => UsuarioSimplificadoOutput, { nullable: true })
  corregidoPor?: UsuarioSimplificadoOutput;

  @Field()
  necesitaRevision: boolean;

  @Field()
  fueRevisado: boolean;

  @Field()
  resumen: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}